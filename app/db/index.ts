import { fetch, sql } from "bun";
import { Stock, stocksResponseSchema, Agent, agentSchema, holdingSchema, holdingsHistorySchema, Holding, transactionSchema, transactionsWithAgentSchema, HistoryRow, outputsWithAgentSchema, agentPerformanceMarkersSchema } from "../schema";

export async function getAgents(): Promise<Agent[]> {
    const agents = await sql`SELECT * FROM agents WHERE active = ${true}`;
    const parsed = agentSchema.array().safeParse(agents);
    if (!parsed.success) {
        console.log(parsed.error.issues);
        return [];
    }
    return parsed.data
}

export async function updateAgentBalance(agent_id: string, balance: number) {
    await sql`UPDATE agents SET balance = ${balance} WHERE id = ${agent_id}`;
}

export async function getAgent(agent_id: string) {
    const agent = await sql`SELECT * FROM agents WHERE id = ${agent_id}`;
    const parsed = agentSchema.safeParse(agent[0]);
    if (!parsed.success) {
        console.log(parsed.error.issues);
        return null;
    }
    return parsed.data;
}

export async function getStocksData(): Promise<{ status: boolean, data: Stock[] | null }> {
    try {
        const response = await fetch(process.env.STOCK_URL!);
        const data = await response.json();
        const parsed = stocksResponseSchema.safeParse(data);
        if (!parsed.success) {
            console.log(parsed.error.issues);
            return { status: false, data: null }
        }
        return { status: true, data: parsed.data }
    } catch (error) {
        console.log(error);
        return { status: false, data: null }
    }
}

export async function getHoldings(agent_id: string): Promise<Holding[]> {
    const response = await sql`SELECT * from holdings where agent_id = ${agent_id}`;
    const parsed = holdingSchema.array().safeParse(response);
    if (!parsed.success) {
        console.log(parsed.error.issues);
        return [];
    }
    return parsed.data;
}

export async function logAgentOutput(agent_id: string, output: string) {
    const result = await sql`INSERT INTO agent_output_logs (agent_id, output) VALUES (${agent_id}, ${output}) RETURNING id`;
    return result[0].id as number;
}

export async function executeBuy(agent_id: string, ticker: string, qty: number, price: number, totalCost: number, log_id: number, newAvgPrice: number) {
    await sql.begin(async (tx) => {
        await tx`UPDATE agents SET balance = balance - ${totalCost} WHERE id = ${agent_id}`;
        await tx`INSERT INTO holdings (agent_id, symbol, qty, avg_buy_price, live_price) 
                 VALUES (${agent_id}, ${ticker}, ${qty}, ${newAvgPrice}, ${price})
                 ON CONFLICT (agent_id, symbol)
                 DO UPDATE SET qty = holdings.qty + EXCLUDED.qty, avg_buy_price = EXCLUDED.avg_buy_price, live_price = EXCLUDED.live_price`;
        await tx`INSERT INTO transactions (agent_id, symbol, side, qty, price, log_id)
                 VALUES (${agent_id}, ${ticker}, 'BUY', ${qty}, ${price}, ${log_id || null})`
        await tx`UPDATE holdings SET live_price = ${price} WHERE symbol = ${ticker}`;
    });
}

export async function executeSell(agent_id: string, ticker: string, qtyToSell: number, price: number, totalCredit: number, log_id?: number) {
    await sql.begin(async (tx) => {
        await tx`UPDATE agents SET balance = balance + ${totalCredit} WHERE id = ${agent_id}`;
        await tx`UPDATE holdings SET qty = qty - ${qtyToSell}, live_price = ${price} WHERE agent_id = ${agent_id} AND symbol = ${ticker}`;
        await tx`DELETE FROM holdings WHERE agent_id = ${agent_id} AND symbol = ${ticker} AND qty <= 0`;
        await tx`INSERT INTO transactions (agent_id, symbol, side, qty, price, log_id)
                 VALUES (${agent_id}, ${ticker}, 'SELL', ${qtyToSell}, ${price}, ${log_id || null})`;
        await tx`UPDATE holdings SET live_price = ${price} WHERE symbol = ${ticker}`;
    });
}

export async function recordAgentHoldingsSnapshot(agent_id: string, balance: number, stocks_price: number) {
    console.info('Recording holdings snapshot for agent', agent_id, 'with balance', balance, 'and stocks price', stocks_price);
    await sql`INSERT INTO holdings_history (agent_id, balance, stocks_price, time) VALUES (${agent_id}, ${balance}, ${stocks_price}, NOW())`;
}

export async function getHoldingsHistory(agent_id: string) {
    const response = await sql`SELECT * FROM holdings_history WHERE agent_id = ${agent_id} ORDER BY time ASC`;
    const parsed = holdingsHistorySchema.array().safeParse(response);
    if (!parsed.success) {
        console.log(parsed.error.issues);
        return [];
    }
    return parsed.data;
}

export async function getLastTransactions(count = 10) {
    const response = await sql`SELECT t.*, a.name FROM transactions t join agents a on t.agent_id = a.id ORDER BY t.time DESC LIMIT ${count}`;
    const parsed = transactionsWithAgentSchema.array().safeParse(response);
    if (!parsed.success) {
        console.log(parsed.error.issues);
        return [];
    }
    return parsed.data;
}

export async function getFormattedChartData() {
    const rawHistory = await sql<HistoryRow[]>`
    SELECT a.name, h.balance, h.stocks_price, h.time 
    FROM holdings_history h 
    JOIN agents a ON h.agent_id = a.id 
    ORDER BY h.time ASC
  `;

    const timeMap: Record<string, any> = {};

    rawHistory.forEach((row: HistoryRow) => {
        const d = new Date(row.time);
        // Convert to IST (Asia/Kolkata) string for grouping
        const istString = d.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        // We use a simplified key for the X-axis label
        // If it's a new day, we show the date; otherwise, just the time
        if (!timeMap[istString]) {
            timeMap[istString] = {
                displayTime: istString,
                rawTime: d.getTime()
            };
        }

        timeMap[istString][row.name] = Number(row.balance) + Number(row.stocks_price);
    });

    return Object.values(timeMap).sort((a, b) => a.rawTime - b.rawTime);
}


export async function getLastInvocations(count = 10) {
    const response = await sql`SELECT i.*, a.name FROM agent_output_logs i join agents a on i.agent_id = a.id ORDER BY i.created_at DESC LIMIT ${count}`;
    const parsed = outputsWithAgentSchema.array().safeParse(response);
    if (!parsed.success) {
        console.log(parsed.error.issues);
        return [];
    }
    return parsed.data;
}

export async function getAgentPerformanceMarkers(agent_id: string) {
    const stats = await sql`
        WITH initial AS (
            SELECT balance FROM holdings_history 
            WHERE agent_id = ${agent_id} ORDER BY time ASC LIMIT 1
        ),
        start_of_day AS (
            SELECT (balance + stocks_price) as wealth FROM holdings_history 
            WHERE agent_id = ${agent_id} AND time < CURRENT_DATE 
            ORDER BY time DESC LIMIT 1
        )
        SELECT 
            (SELECT balance FROM initial) as initial_wealth,
            COALESCE((SELECT wealth FROM start_of_day), (SELECT balance FROM initial)) as start_of_day_wealth;
    `;
    const parsed = agentPerformanceMarkersSchema.safeParse(stats[0]);
    if (!parsed.success) {
        console.log(parsed.error.issues);
        return null;
    }
    return parsed.data;
}