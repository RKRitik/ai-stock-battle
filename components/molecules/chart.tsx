"use client";
import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts";

interface ChartPoint {
  index: number;
  [key: string]: any;
}

const strokes = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe"];

export default function Chart() {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("/api/chart");
    eventSource.onmessage = (event) => {
      const newPoint = JSON.parse(event.data);
      setChartData((prev) => [
        ...prev,
        { ...newPoint, index: prev.length + 1 }
      ]);
    };
    return () => eventSource.close();
  }, []);

  if (chartData.length === 0) return <div>Loading...</div>;

  return (
    <LineChart style={{ width: "100%", aspectRatio: 1.618, maxWidth: 800, margin: "auto" }} responsive data={chartData}>
      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
      <XAxis />
      <YAxis width="auto" />
      <Legend />
      {Object.keys(chartData[0]).map((key, index) => (
        <Line
          key={key}
          type="monotone"
          dataKey={key}
          stroke={strokes[index % strokes.length]}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false} 
        />
      ))}
    </LineChart>
  );
}