import { getAgents, getHoldingsHistory } from "./app/db";
import { round2 } from "./lib/utils";

const agents = await getAgents();

for (const agent of agents) {
    const history = await getHoldingsHistory(agent.id);

    console.log(`\n=== Performance History: ${agent.name} ===`);
    console.log(`Time                | Cash       | Portfolio  | Total Wealth`);
    console.log(`-----------------------------------------------------------`);

    history.forEach((entry: any) => {
        const time = new Date(entry.time).toLocaleTimeString();
        const cash = round2(entry.balance).toFixed(2).padStart(10);
        const portfolio = round2(entry.stocks_price).toFixed(2).padStart(10);
        const total = round2(entry.balance + entry.stocks_price).toFixed(2).padStart(12);

        console.log(`${time} | ${cash} | ${portfolio} | ${total}`);
    });
}
