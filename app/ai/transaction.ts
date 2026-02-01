//decode and run a transaction
//update transaction db
//update agent db

import { cleanResponse } from "@/lib/utils";
import { agentResponseSchema } from "../schema";
import { getAgent } from "../db";

//update holdings db
export async function doTransaction(agent_id: string, responseString: string) {
    const agent = await getAgent(agent_id);
    if (!agent) {
        console.error("Agent not found for id", agent_id);
        return;
    }
    //console.log({ agent: agent.name, responseString });

    const parsedJson = JSON.parse(cleanResponse(responseString));

    console.log({ name: agent?.name, parsedJson });
    // const result = agentResponseSchema.safeParse(parsedJson);
    // if (!result.success) {
    //     console.error("Invalid agent response:", responseString, result.error.issues);
    //     return;
    // }
    // const transactions = result.data;
    // if (transactions.length === 0) {
    //     console.log("No transactions to perform for agent", agent_id);
    //     return;
    // }
    // transactions.forEach(transaction => {
    //     const { action, ticker, qty } = transaction;
    //     if (action === "BUY") {
    //         //console.log({ name: agent?.name, action: "BUY", ticker, qty });
    //         //
    //     }
    //     if (action === "SELL") {
    //         //console.log({ name: agent?.name, action: "SELL", ticker, qty });
    //         //
    //     }
    // });
}