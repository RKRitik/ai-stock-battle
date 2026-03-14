import { cleanResponse, round2 } from "@/lib/utils";
import { agentResponseSchema, Stock } from "../schema";
import { getAgent, getHoldings, executeBuy, executeSell, logAgentOutput, recordAgentHoldingsSnapshot } from "../db";
import { STOCK_MAP } from "../api/angelone/market";
import type { OrderParams, TransactionType, OrderType, ProductType, OrderDuration, Exchange } from "../api/angelone/order";
import { estimateCharges, type BrokerageOrder } from "../api/angelone/brokerage";

export function normalizeTicker(ticker: string): string {
    return ticker.trim().replace(/^(NSE:|BSE:)/i, '');
}

export async function estimateTransactionCharges(
    ticker: string,
    action: "BUY" | "SELL",
    qty: number,
    price: number,
    productType: "DELIVERY" | "INTRADAY" = "DELIVERY"
): Promise<number> {
    const normalizedTicker = normalizeTicker(ticker);
    const stockInfo = STOCK_MAP[normalizedTicker];
    if (!stockInfo) {
        console.warn(`No stock mapping found for ${normalizedTicker}, returning 0 charges`);
        return 0;
    }

    const order: BrokerageOrder = {
        product_type: productType,
        transaction_type: action,
        quantity: String(qty),
        price: String(price),
        exchange: "NSE",
        symbol_name: stockInfo.symbol,
        token: stockInfo.token,
    };

    try {
        const response = await estimateCharges([order]);
        if (response.status && response.data?.summary?.total_charges) {
            return round2(response.data.summary.total_charges);
        }
        console.warn(`Failed to estimate charges for ${normalizedTicker}:`, response.message);
        return 0;
    } catch (error) {
        console.error(`Error estimating charges for ${normalizedTicker}:`, error);
        return 0;
    }
}

export function createAngelOneOrderPayload(
    ticker: string,
    action: "BUY" | "SELL",
    qty: number,
    price: number,
    orderType: OrderType = "MARKET",
    productType: ProductType = "DELIVERY"
): OrderParams | null {
    const normalizedTicker = normalizeTicker(ticker);
    const stockInfo = STOCK_MAP[normalizedTicker];
    if (!stockInfo) {
        console.error(`No Angel One mapping found for ticker: ${ticker}`);
        return null;
    }

    const payload: OrderParams = {
        variety: "NORMAL",
        tradingsymbol: stockInfo.symbol,
        symboltoken: stockInfo.token,
        transactiontype: action as TransactionType,
        exchange: "NSE" as Exchange,
        ordertype: orderType,
        producttype: productType,
        duration: "DAY" as OrderDuration,
        price: price,
        quantity: qty,
    };

    return payload;
}

export async function doTransaction(agent_id: string, responseString: string, stocksData: Stock[]) {
    const agent = await getAgent(agent_id);
    if (!agent) {
        console.error("Agent not found for id", agent_id);
        return;
    }

    const logId = await logAgentOutput(agent_id, responseString);

    let parsedJson;
    try {
        parsedJson = JSON.parse(cleanResponse(responseString));
    } catch (e) {
        console.error("Failed to parse AI response:", responseString);
        return;
    }

    const result = agentResponseSchema.safeParse(parsedJson);
    console.log({ intents: result.data, name: agent.name });
    if (!result.success) {
        console.error("Invalid agent response for agent", agent.name, ":", parsedJson, result.error.issues);
        return;
    }

    // sort intents so SELLS happen before BUYS
    const sortedIntents = [...result.data].sort((a, b) => {
        if (a.action === "SELL" && b.action !== "SELL") return -1;
        if (a.action !== "SELL" && b.action === "SELL") return 1;
        return 0;
    });

    const initialBalance = round2(agent.balance);
    let currentBalance = round2(agent.balance);

    for (const intent of sortedIntents) {
        // fetch fresh holdings for each intent to account for previous actions in the loop
        const currentHoldings = await getHoldings(agent_id);
        const { action, ticker, allocation } = intent;
        const normalizedTicker = normalizeTicker(ticker);
        const stock = stocksData.find(s => s.ticker === normalizedTicker);

        if (!stock) {
            console.error(`Stock ${ticker} (normalized: ${normalizedTicker}) not found in market data`);
            continue;
        }

        const price = round2(stock.live_price);

        if (action === "BUY") {
            const amountToInvest = round2(initialBalance * (allocation / 100));
            let qty = Math.floor(amountToInvest / price);

            // limit the quantity based on actual remaining cash
            if (qty * price > currentBalance) {
                qty = Math.floor(currentBalance / price);
            }

            if (qty > 0) {
                // 1. Find if we already own this stock
                const existingHolding = currentHoldings.find(h => normalizeTicker(h.symbol) === normalizedTicker);
                const oldQty = existingHolding?.qty || 0;
                const oldAvg = Number(existingHolding?.avg_buy_price) || 0;
                
                // Estimate brokerage/charges for this trade FIRST
                const estimatedCharges = await estimateTransactionCharges(normalizedTicker, "BUY", qty, price, "DELIVERY");
                const totalCost = round2(qty * price);
                const totalWithCharges = round2(totalCost + estimatedCharges);

                // Re-check: can we afford (cost + charges)?
                if (totalWithCharges > currentBalance) {
                    // Recalculate max qty we can afford including charges
                    qty = Math.floor((currentBalance - estimatedCharges) / price);
                    if (qty <= 0) {
                        console.info(`[SKIP] BUY for ${agent.name}: Not enough balance for ${normalizedTicker} (Price: ₹${price}, Charges: ₹${estimatedCharges})`);
                        continue;
                    }
                    // Recalculate costs with new qty
                    const newTotalCost = round2(qty * price);
                    const newTotalWithCharges = round2(newTotalCost + estimatedCharges);
                    currentBalance = round2(currentBalance - newTotalWithCharges);
                } else {
                    currentBalance = round2(currentBalance - totalWithCharges);
                }

                // 2. Calculate the New Weighted Average
                const newTotalQty = oldQty + qty;
                const newAvgBuyPrice = round2(((oldQty * oldAvg) + (qty * price)) / newTotalQty);
                
                try {
                    await executeBuy(agent_id, normalizedTicker, qty, price, round2(qty * price), logId, newAvgBuyPrice, estimatedCharges);
                    
                    // Generate Angel One order payload (for simulation/future live trading)
                    const orderPayload = createAngelOneOrderPayload(normalizedTicker, "BUY", qty, price);
                    if (orderPayload) {
                        console.log(`[ANGEL_ONE_ORDER] ${JSON.stringify(orderPayload)}`);
                    }
                    
                    console.log(`[BUY] Agent ${agent.name} bought ${qty} shares of ${normalizedTicker} at ${price} (Charges: ₹${estimatedCharges}) New Avg Price: ${newAvgBuyPrice}`);
                } catch (err) {
                    console.error(`Failed to execute BUY ${qty} shares of ${normalizedTicker} for ${agent.name}:`, err);
                }
            } else {
                console.info(`[SKIP] BUY for ${agent.name}: Allocation (${allocation}%) of ${initialBalance} is less than stock price ${price}`);
            }
        } else if (action === "SELL") {
            const holding = currentHoldings.find(h => normalizeTicker(h.symbol) === normalizedTicker);
            if (!holding || holding.qty === 0) {
                console.warn(`[SKIP] Agent ${agent.name} has no holdings for ${normalizedTicker} to sell`);
                continue;
            }

            let qtyToSell = Math.floor(holding.qty * (allocation / 100));
            // If they want to sell a percentage but it floors to 0, sell 1 share instead
            if (qtyToSell === 0 && allocation > 0 && holding.qty > 0) {
                qtyToSell = 1;
            }
            if (qtyToSell > 0) {
                const totalCredit = round2(qtyToSell * price);
                
                // Estimate brokerage/charges for this trade
                const estimatedCharges = await estimateTransactionCharges(normalizedTicker, "SELL", qtyToSell, price, "DELIVERY");
                
                try {
                    await executeSell(agent_id, normalizedTicker, qtyToSell, price, totalCredit, logId, estimatedCharges);
                    currentBalance = round2(currentBalance + totalCredit - estimatedCharges);
                    
                    // Generate Angel One order payload (for simulation/future live trading)
                    const orderPayload = createAngelOneOrderPayload(normalizedTicker, "SELL", qtyToSell, price);
                    if (orderPayload) {
                        console.log(`[ANGEL_ONE_ORDER] ${JSON.stringify(orderPayload)}`);
                    }
                    
                    console.log(`[SELL] Agent ${agent.name} sold ${qtyToSell} shares of ${normalizedTicker} at ${price} (Charges: ₹${estimatedCharges})`);
                } catch (err) {
                    console.error(`Failed to execute SELL ${qtyToSell} shares of ${normalizedTicker} for ${agent.name}:`, err);
                }
            } else {
                console.info(`[SKIP] SELL for ${agent.name}: Allocation (${allocation}%) of ${holding.qty} shares results in 0 shares.`);
            }
        }
    }
    // fetch the agent again to get the absolute latest balance from the DB after all txns
    const finalAgent = await getAgent(agent_id);
    const finalHoldings = await getHoldings(agent_id);

    if (!finalAgent) return;

    const finalBalance = round2(finalAgent.balance);
    let stocks_price = 0;
    let missingStocksValue = false;

    finalHoldings.forEach(holding => {
        const normalizedHoldingSymbol = normalizeTicker(holding.symbol);
        const stock = stocksData.find(s => s.ticker === normalizedHoldingSymbol);
        if (stock) {
            stocks_price += holding.qty * stock.live_price;
        } else {
            console.warn(`[DATA] Stock ${holding.symbol} held by ${agent.name} is missing from current market data. Wealth valuation might be low.`);
            missingStocksValue = true;
        }
    });

    stocks_price = round2(stocks_price);
    const totalWealth = round2(finalBalance + stocks_price);

    console.log(`[SNAPSHOT] ${agent.name} Turn Complete. Wealth: ${totalWealth} (Cash: ${finalBalance}, Portfolio: ${stocks_price}) ${missingStocksValue ? '[!] Valuation partial' : ''}`);

    await recordAgentHoldingsSnapshot(agent_id, finalBalance, stocks_price);
}
