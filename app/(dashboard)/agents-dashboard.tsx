import { getAgentPerformanceMarkersForAgents, getAgents, getHoldingsForAgents } from "@/app/db";
import { getAgentColor } from "@/lib/utils";
import type { Holding } from "@/app/schema";

export const dynamic = "force-dynamic";

export default async function AgentsDashboard() {
    const agents = await getAgents();
    const agentIds = agents.map(a => a.id);

    const [allHoldings, markersMap] = await Promise.all([
        getHoldingsForAgents(agentIds),
        getAgentPerformanceMarkersForAgents(agentIds),
    ]);

    const holdingsByAgent = new Map<string, Holding[]>();
    for (const h of allHoldings) {
        const group = holdingsByAgent.get(h.agent_id);
        if (group) group.push(h);
        else holdingsByAgent.set(h.agent_id, [h]);
    }

    const agentsData = agents.map((agent) => {
        const holdings = holdingsByAgent.get(agent.id) || [];
        const portfolioValue = holdings.reduce((acc, h) => acc + (h.qty * h.live_price), 0);
        const stats = markersMap.get(agent.id) || { initial_wealth: agent.balance, start_of_day_wealth: agent.balance };

        const totalWealth = agent.balance + portfolioValue;
        const todayPnL = totalWealth - stats.start_of_day_wealth;
        const todayChangePercent = stats.start_of_day_wealth > 0
            ? (todayPnL / stats.start_of_day_wealth) * 100
            : 0;

        return {
            ...agent,
            portfolioValue,
            totalWealth,
            todayPnL,
            todayChangePercent,
        };
    });

    return (
        <div className="space-y-3">
            {agentsData.map((agent) => {
                return (
                    <div
                        key={agent.id}
                        className="p-4 rounded-xl border border-primary/10 bg-background/40 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                                    style={{ backgroundColor: getAgentColor(agent.name), color: getAgentColor(agent.name) }}
                                />
                                <p className="text-sm font-bold tracking-tight">{agent.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold">
                                    ₹{agent.portfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Portfolio Value</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <p className={`text-sm font-bold ${agent.todayPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {agent.todayPnL >= 0 ? '▲' : '▼'} ₹{Math.abs(agent.todayPnL).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Today P&L</p>
                            </div>
                            <div className="space-y-1">
                                <p className={`text-sm font-bold ${agent.todayChangePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {agent.todayChangePercent >= 0 ? '+' : ''}{agent.todayChangePercent.toFixed(2)}%
                                </p>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Change</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-primary/80">
                                    ₹{agent.balance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Cash</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
