"use client";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

const strokes = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe"];

export default function Chart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="p-8 text-center">No data...</div>;

  const agentNames = Array.from(
    new Set(data.flatMap((obj) => Object.keys(obj)))
  ).filter((key) => !["displayTime", "rawTime"].includes(key));

  return (
    <div className="h-[450px] w-full bg-white dark:bg-zinc-950 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          
          <XAxis 
            dataKey="displayTime" 
            fontSize={11}
            tickMargin={15}
            axisLine={false}
            tickLine={false}
            // If data is huge, show every 10th or 20th label to keep it clean
            interval="preserveStartEnd"
            minTickGap={50}
          />

          <YAxis 
            fontSize={11}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
            // The "Zoom" Logic: dynamic domain based on data
            domain={['dataMin - 20', 'dataMax + 20']}
            width={80}
          />

          <Tooltip 
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, "Wealth"]}
            labelStyle={{ fontWeight: 'bold', color: '#374151' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          />
          
          <Legend verticalAlign="top" height={36}/>

          <ReferenceLine y={10000} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Start (₹10k)', fontSize: 10, fill: '#ef4444' }} />

          {agentNames.map((name, index) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={strokes[index % strokes.length]}
              strokeWidth={2.5}
              dot={false}
              connectNulls={true}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
