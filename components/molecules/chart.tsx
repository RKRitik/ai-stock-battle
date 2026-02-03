"use client";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const strokes = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe"];

export default function Chart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="p-8 text-center text-zinc-500">No history data yet...</div>;

  // Dynamically find all agent names present in the data keys
  const agentNames = Array.from(
    new Set(data.flatMap((obj) => Object.keys(obj)))
  ).filter((key) => key !== "time" && key !== "rawTime");

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis 
            dataKey="time" 
            fontSize={12} 
            tickMargin={10} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            fontSize={12} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value) => `$${value}`} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend />
          {agentNames.map((name, index) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={strokes[index % strokes.length]}
              strokeWidth={3}
              dot={false}
              connectNulls={true} // Crucial for multi-agent lines
              isAnimationActive={false} // Better performance on low-RAM VM
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}