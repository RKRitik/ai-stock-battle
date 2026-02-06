import { getAgentPerformanceMarkers, getAgents, getHoldings, getStocksData } from "@/app/db";
import { getAgentColor } from "@/lib/utils";

export default async function AgentsDashboard() {
    const agents = await getAgents();

    const agentsData = await Promise.all(agents.map(async (agent) => {
        const holdings = await getHoldings(agent.id);
        const portfolioValue = holdings.reduce((acc, h) => acc + (h.qty * h.live_price), 0);
        const stats = await getAgentPerformanceMarkers(agent.id) || { initial_wealth: agent.balance, start_of_day_wealth: agent.balance };

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
    }));

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
