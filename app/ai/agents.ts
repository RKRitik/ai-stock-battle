import { generateText } from "ai";
import { getModel } from "./registry";
import { Stock, Agent } from "../schema";

export function runAgent(agent: Agent, stocksData: Stock[], holdings: { symbol: string, qty: number }[]) {
    const model = getModel(agent.model_provider, agent.model_id);
    const trimmedStocks = stocksData.slice(0, agent.max_stocks);
    let finalPrompt = agent.system_prompt.replace('${balance}', agent.balance.toString());
    finalPrompt = finalPrompt.replace('${holdings}', JSON.stringify(holdings));
    finalPrompt = finalPrompt.replace('${stocksData}', JSON.stringify(trimmedStocks));
    const response = generateText({
        model,
        prompt: finalPrompt,
    });
    return response;
}
