import { getAgentPerformanceMarkers, getAgents, getHoldings, getStocksData } from "@/app/db";
import { getAgentColor } from "@/lib/utils";

export default async function AgentsDashboard() {
    const agents = await getAgents();
    const stocksData = await getStocksData();

    function getLivePrice(symbol: string) {
        if (!stocksData.data) return 0;
        return stocksData.data.find((stock) => stock.ticker === symbol)?.live_price || 0;
    }

    const agentsData = await Promise.all(agents.map(async (agent) => {
        const holdings = await getHoldings(agent.id);
        const portfolioValue = holdings.reduce((acc, h) => acc + (h.qty * getLivePrice(h.symbol)), 0);
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
                        className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getAgentColor(agent.name) }}
                                />
                                <p className="text-sm font-semibold">{agent.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold">
                                    ₹{agent.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-muted-foreground">Portfolio Value</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <p className={`text-sm font-semibold ${agent.todayPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {agent.todayPnL >= 0 ? '+' : ''}₹{Math.abs(agent.todayPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-muted-foreground">Today P&L</p>
                            </div>
                            <div>
                                <p className={`text-sm font-semibold ${agent.todayChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {agent.todayChangePercent >= 0 ? '+' : ''}{agent.todayChangePercent.toFixed(2)}%
                                </p>
                                <p className="text-xs text-muted-foreground">Today Change</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    ₹{agent.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-muted-foreground">Cash Balance</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
