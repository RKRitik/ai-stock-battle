import { getAgents, getHoldings } from '../db'
import AgentStocksClient from './agent-stocks-client';

export default async function AgentStocks() {
    const agents = await getAgents();

    if (!agents || agents.length === 0) return null;

    const initialHoldings = await getHoldings(agents[0].id);

    return <AgentStocksClient agents={agents} initialHoldings={initialHoldings} />;
}
