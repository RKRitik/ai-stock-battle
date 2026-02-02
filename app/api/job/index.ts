import { runAgent } from "@/app/ai/agents";
import { doTransaction } from "@/app/ai/transaction";
import { getAgents, getHoldings, getStocksData } from "@/app/db";
import { NextResponse } from "next/server";

export async function GET() {
    // Fetch stocks data
    const result = await getStocksData();

    if (!result.status || !result.data) {
        return NextResponse.json({ error: "Failed to fetch stocks data" }, { status: 500 });
    }

    const agents = await getAgents();

    if(!agents.length) {
        return NextResponse.json({ error: "No agents found" }, { status: 404 });
    }

    // Run jobs for all agents in parallel
    const agentResults = await Promise.all(
        agents.map(async agent => {
            const holdings = await getHoldings(agent.id);
            const res: { text: string } = await runAgent(agent, result.data!, holdings.map(h => ({ symbol: h.symbol, qty: h.qty })));
            await doTransaction(agent.id, res.text, result.data!);
            return { agent: agent.name, result: res };
        })
    );

    return NextResponse.json({ status: "success", agents: agentResults });
}
