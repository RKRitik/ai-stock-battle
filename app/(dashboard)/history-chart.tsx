"use client";

import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine } from "recharts";

import { getAgentColor } from "@/lib/utils";

interface HistoryChartProps {
    data: any[];
}

export default function HistoryChart({ data }: HistoryChartProps) {
    const agentNames = Array.from(
        new Set(data.flatMap((obj) => Object.keys(obj)))
    ).filter((key) => !["displayTime", "rawTime", "time"].includes(key));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.3} vertical={false} />
                <XAxis
                    dataKey="displayTime"
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    width={80}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    formatter={(value: number | undefined, name: string | undefined) => [
                        value ? `₹${value.toLocaleString('en-IN')}` : "₹0",
                        name || 'Unknown Agent'
                    ]}
                    contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(8px)',
                    }}
                    itemStyle={{ fontSize: '12px' }}
                    labelStyle={{ color: 'var(--foreground)', fontWeight: '600', marginBottom: '4px' }}
                />
                <Legend iconType="circle" />
                <ReferenceLine
                    y={10000}
                    stroke="oklch(0.6 0.2 25)"
                    strokeDasharray="4 4"
                    label={{ position: 'right', value: 'Start (₹10k)', fontSize: 10, fill: 'oklch(0.6 0.2 25)', opacity: 0.8, fontWeight: '500' }}
                />
                {agentNames.map((name) => (
                    <Line
                        type="monotone"
                        key={name}
                        dataKey={name}
                        stroke={getAgentColor(name)}
                        strokeWidth={3}
                        dot={false}
                        isAnimationActive={false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}
