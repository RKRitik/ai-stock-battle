import { generateText } from "ai";
import { getModel } from "./registry";
import { sql } from "bun";

const agents = await sql`SELECT * FROM agents WHERE active = ${true}`;
const responses: any[] = [];
agents.forEach((agent: any) => {
    const model = getModel(agent.model_provider, agent.model_id);
    const response = generateText({
        model,
        prompt: agent.system_prompt,
    });
    responses.push(response);
});

Promise.all(responses).then((responses) => {
    console.log(responses.map((response) => {
        return response.text;
    }));
});