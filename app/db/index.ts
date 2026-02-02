import { fetch, sql } from "bun";
import { Stock, stocksResponseSchema, Agent, agentSchema, holdingSchema, holdingsHistorySchema, Holding } from "../schema";

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

export async function executeBuy(agent_id: string, ticker: string, qty: number, price: number, totalCost: number, log_id?: number) {
    await sql.begin(async (tx) => {
        await tx`UPDATE agents SET balance = balance - ${totalCost} WHERE id = ${agent_id}`;
        await tx`INSERT INTO holdings (agent_id, symbol, qty) 
                 VALUES (${agent_id}, ${ticker}, ${qty})
                 ON CONFLICT (agent_id, symbol) 
                 DO UPDATE SET qty = holdings.qty + ${qty}`;
        await tx`INSERT INTO transactions (agent_id, symbol, side, qty, price, log_id)
                 VALUES (${agent_id}, ${ticker}, 'BUY', ${qty}, ${price}, ${log_id || null})`;
    });
}

export async function executeSell(agent_id: string, ticker: string, qtyToSell: number, price: number, totalCredit: number, log_id?: number) {
    await sql.begin(async (tx) => {
        await tx`UPDATE agents SET balance = balance + ${totalCredit} WHERE id = ${agent_id}`;
        await tx`UPDATE holdings SET qty = qty - ${qtyToSell} WHERE agent_id = ${agent_id} AND symbol = ${ticker}`;
        await tx`DELETE FROM holdings WHERE agent_id = ${agent_id} AND symbol = ${ticker} AND qty <= 0`;
        await tx`INSERT INTO transactions (agent_id, symbol, side, qty, price, log_id)
                 VALUES (${agent_id}, ${ticker}, 'SELL', ${qtyToSell}, ${price}, ${log_id || null})`;
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