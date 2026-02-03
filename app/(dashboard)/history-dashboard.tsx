import { getFormattedChartData } from "@/app/db";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine } from "recharts";

const strokes = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe"];

export default async function HistoryDashboard() {
    const data = await getFormattedChartData();
    const agentNames = Array.from(
        new Set(data.flatMap((obj) => Object.keys(obj)))
    ).filter((key) => !["displayTime", "rawTime"].includes(key));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
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
                {agentNames.map((name, index) => (
                    <Line type="monotone" key={name} dataKey={name} stroke={strokes[index % strokes.length]} strokeWidth={3} dot={false} isAnimationActive={false} />
                ))}

                <Line type="monotone" dataKey="agent2" stroke="#00a8e8" strokeWidth={3} dot={false} name="Agent Beta" isAnimationActive={false} />
                <Line type="monotone" dataKey="agent3" stroke="#5d5d5d" strokeWidth={3} dot={false} name="Agent Gamma" isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}