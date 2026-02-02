import { getAgents } from "@/app/db";
export default async function AgentsDashboard() {
    const agents = await getAgents();
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Agents Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map(agent => (
                    <div key={agent.id} className="border p-4 rounded-lg">
                        <h2 className="text-xl font-bold">{agent.name}</h2>
                        <p>Balance: ₹{agent.balance}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}