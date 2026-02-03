import { getAgents } from "@/app/db";
import { getAgentColor } from "@/lib/utils";

export default async function AgentsDashboard() {
    const agents = await getAgents();
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.map((agent) => (
                <div
                    key={agent.id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getAgentColor(agent.name) }}
                        />
                        <p className="text-sm font-medium">{agent.name}</p>
                    </div>

                    <p className="text-l font-semibold leading-4">
                        ₹{agent.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Cash Balance</p>
                </div>
            ))}
        </div>
    );
}