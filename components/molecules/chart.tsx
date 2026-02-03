"use client";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const strokes = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe"];

export default function Chart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div>No data available</div>;

  // Get agent names by looking at keys that aren't 'time'
  const agentNames = Object.keys(data[0]).filter((key) => key !== "time");

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Legend />
          {agentNames.map((name, index) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={strokes[index % strokes.length]}
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}