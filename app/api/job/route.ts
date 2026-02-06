import { runAgent } from "@/app/ai/agents";
import { doTransaction } from "@/app/ai/transaction";
import { getAgents, getHoldings, getStocksData } from "@/app/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const authHeader = request.headers.get("Authorization");
    const jobKey = process.env.JOB_KEY;
    if (jobKey && authHeader !== `Bearer ${jobKey}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isSimulate = searchParams.get("simulate") === "true";

    // Fetch stocks data
    const result = await getStocksData();

    if (!result.status || !result.data) {
        return NextResponse.json({ error: "Failed to fetch stocks data" }, { status: 500 });
    }

    const agents = await getAgents();

    if (!agents.length) {
        return NextResponse.json({ error: "No agents found" }, { status: 404 });
    }

    // Run jobs for all agents in parallel
    const agentResults = await Promise.all(
        agents.map(async agent => {
            const holdings = await getHoldings(agent.id);
            const res: { text: string } = await runAgent(agent, result.data!, holdings.map(h => ({ symbol: h.symbol, qty: h.qty, avg_buy_price: h.avg_buy_price })));
            if (!isSimulate) {
                await doTransaction(agent.id, res.text, result.data!);
            }
            return { agent: agent.name, result: res.text };
        })
    );

    return NextResponse.json({ status: "success", agents: agentResults });
}
