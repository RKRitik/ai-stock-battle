//decode and run a transaction
//update transaction db
//update agent db

import { cleanResponse } from "@/lib/utils";
import { agentResponseSchema } from "../schema";

//update holdings db
export async function doTransaction(agent_id: string, responseString: string) {
    const parsedJson = JSON.parse(cleanResponse(responseString));
    const result = agentResponseSchema.safeParse(parsedJson);
    if (!result.success) {
        console.error("Invalid agent response:", responseString, result.error.issues);
        return;
    }
    const transactions = result.data;
    if (transactions.length === 0) {
        console.log("No transactions to perform for agent", agent_id);
        return;
    }
    transactions.forEach(transaction => {
        const { action, ticker, qty } = transaction;
        if (action === "BUY") {
            console.log(agent_id, "BUY", { ticker, qty });
            //
        }
        if (action === "SELL") {
            console.log(agent_id, "SELL", { ticker, qty });
            //
        }
    });
}