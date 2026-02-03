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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="displayTime" stroke="#6b7280" />
                <YAxis
                    stroke="#6b7280"
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    width={80}
                />
                <Tooltip
                    formatter={(value: number | undefined, name: string | undefined) => [
                        value ? `₹${value.toLocaleString('en-IN')}` : "₹0",
                        name || 'Unknown Agent'
                    ]}
                    contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{ color: '#000' }}
                />
                <Legend />
                <ReferenceLine
                    y={10000}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    label={{ position: 'right', value: 'Start (₹10k)', fontSize: 10, fill: '#ef4444', opacity: 0.6 }}
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
