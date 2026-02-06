'use client'

import { useState, useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getAgentColor } from '@/lib/utils';
import type { Agent, Holding } from '@/app/schema';
import { fetchHoldingsAction } from '../actions/portfolio';

interface AgentStocksClientProps {
    agents: Agent[];
    initialHoldings: Holding[];
}

export default function AgentStocksClient({ agents, initialHoldings }: AgentStocksClientProps) {
    const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || "");
    const [holdings, setHoldings] = useState<Holding[]>(initialHoldings);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (selectedAgentId && selectedAgentId !== agents[0]?.id) {
            const updateHoldings = async () => {
                setIsLoading(true);
                try {
                    const data = await fetchHoldingsAction(selectedAgentId);
                    setHoldings(data);
                } catch (error) {
                    console.error("Failed to fetch holdings:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            updateHoldings();
        } else if (selectedAgentId === agents[0]?.id) {
            setHoldings(initialHoldings);
        }
    }, [selectedAgentId, agents, initialHoldings]);

    const selectedAgent = agents.find((a) => a.id === selectedAgentId);

    if (!selectedAgent) return null;

    return (
        <div className="space-y-6">
            <Select value={selectedAgentId} onValueChange={(val) => setSelectedAgentId(val)}>
                <SelectTrigger className="w-full sm:w-56 border-primary/10 bg-background/50 backdrop-blur-md focus:ring-primary/20 hover:border-primary/20 transition-all font-semibold text-foreground">
                    <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent className="bg-background/80 backdrop-blur-lg border-primary/10">
                    {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id} className="focus:bg-primary/10 focus:text-primary font-medium">
                            {agent.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className={`grid grid-cols-1 gap-4 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {holdings.map((stock) => {
                    const gainLoss = (stock.live_price - stock.avg_buy_price) * stock.qty
                    const gainLossPercent = ((stock.live_price - stock.avg_buy_price) / stock.avg_buy_price) * 100

                    return (
                        <div key={stock.symbol} className="p-4 rounded-xl border border-primary/10 bg-background/40 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 group shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                                        style={{ backgroundColor: getAgentColor(selectedAgent.name), color: getAgentColor(selectedAgent.name) }}
                                    />
                                    <p className="font-bold tracking-tight text-sm uppercase">{stock.symbol}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${gainLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {gainLoss >= 0 ? '▲' : '▼'} ₹{Math.abs(gainLoss).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </p>
                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${gainLossPercent >= 0 ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                                        {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 border-t border-primary/5 pt-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Quantity</p>
                                    <p className="font-bold text-sm tabular-nums text-foreground">{stock.qty}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Avg Price</p>
                                    <p className="font-bold text-sm tabular-nums text-foreground/80">₹{stock.avg_buy_price.toFixed(0)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Current</p>
                                    <p className="font-bold text-sm tabular-nums text-primary/80">₹{stock.live_price.toFixed(0)}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
