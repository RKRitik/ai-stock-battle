import { cleanResponse, round2 } from "@/lib/utils";
import { agentResponseSchema, Stock } from "../schema";
import { getAgent, getHoldings, executeBuy, executeSell, logAgentOutput, recordAgentHoldingsSnapshot } from "../db";

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
        const stock = stocksData.find(s => s.ticker === ticker);

        if (!stock) {
            console.error(`Stock ${ticker} not found in market data`);
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
                const existingHolding = currentHoldings.find(h => h.symbol === ticker);
                const oldQty = existingHolding?.qty || 0;
                const oldAvg = Number(existingHolding?.avg_buy_price) || 0;
                const totalCost = round2(qty * price);

                // 2. Calculate the New Weighted Average
                const newTotalQty = oldQty + qty;
                const newAvgBuyPrice = round2(((oldQty * oldAvg) + (qty * price)) / newTotalQty);
                try {
                    await executeBuy(agent_id, ticker, qty, price, totalCost, logId, newAvgBuyPrice);
                    currentBalance = round2(currentBalance - totalCost);
                    console.log(`[BUY] Agent ${agent.name} bought ${qty} shares of ${ticker} at ${price} (Allocation: ${allocation}%) New Avg Price: ${newAvgBuyPrice}`);
                } catch (err) {
                    console.error(`Failed to execute BUY ${qty} shares of ${ticker} for ${agent.name}:`, err);
                }
            } else {
                console.info(`[SKIP] BUY for ${agent.name}: Allocation (${allocation}%) of ${initialBalance} is less than stock price ${price}`);
            }
        } else if (action === "SELL") {
            const holding = currentHoldings.find(h => h.symbol === ticker);
            if (!holding || holding.qty === 0) {
                console.warn(`[SKIP] Agent ${agent.name} has no holdings for ${ticker} to sell`);
                continue;
            }

            const qtyToSell = Math.floor(holding.qty * (allocation / 100));
            if (qtyToSell > 0) {
                const totalCredit = round2(qtyToSell * price);
                try {
                    await executeSell(agent_id, ticker, qtyToSell, price, totalCredit, logId);
                    currentBalance = round2(currentBalance + totalCredit);
                    console.log(`[SELL] Agent ${agent.name} sold ${qtyToSell} shares of ${ticker} at ${price} (Allocation: ${allocation}%)`);
                } catch (err) {
                    console.error(`Failed to execute SELL ${qtyToSell} shares of ${ticker} for ${agent.name}:`, err);
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
        const stock = stocksData.find(s => s.ticker === holding.symbol);
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