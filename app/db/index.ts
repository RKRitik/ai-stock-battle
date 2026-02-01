import { fetch, sql } from "bun";
import { Stock, stocksResponseSchema, Agent, agentSchema, holdingSchema } from "../schema";

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
        const response = await fetch(process.env.NEXT_PUBLIC_STOCK_URL!);
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

export async function getHoldings(agent_id: string) {
    const response = await sql`SELECT * from holdings where agent_id = ${agent_id}`;
    const parsed = holdingSchema.array().safeParse(response);
    if (!parsed.success) {
        console.log(parsed.error.issues);
        return [];
    }
    return parsed.data;
}