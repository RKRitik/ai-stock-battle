import { runAgent } from "./app/ai/agents";
import { doTransaction } from "./app/ai/transaction";
import { getStocksData, getAgents, getHoldings } from "./app/db";

console.log("Fetching stocks data...");

const result = await getStocksData();

if (!result.status || !result.data) {
    console.error("Failed to fetch stocks data");
    process.exit(1);
}

const agents = await getAgents();

agents.forEach(async agent => {
    const holdings = await getHoldings(agent.id);
    runAgent(agent, result.data!, holdings.map(h => ({ symbol: h.symbol, qty: h.qty, avg_buy_price: h.avg_buy_price }))).then(res => {
        doTransaction(agent.id, res.text, result.data!);
    });
});


