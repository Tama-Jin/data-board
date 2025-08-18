"use client";
import {
  ComposedChart, XAxis, YAxis, Tooltip, Legend,
  Line, Bar, ResponsiveContainer, CartesianGrid,
} from "recharts";

export default function WeatherChart({ daily }: { daily: any[] }) {
  const data = daily.map(d => ({
    day: d.date.slice(5),       // MM-DD
    max: d.tempMax,
    min: d.tempMin,
    popPct: Math.round(d.pop * 100), // 0~100
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis yAxisId="left" domain={["dataMin-2","dataMax+2"]} unit="°C" />
          <YAxis yAxisId="right" orientation="right" domain={[0,100]} unit="%" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="right" dataKey="popPct" name="POP(%)" />
          <Line yAxisId="left" type="monotone" dataKey="max" name="Max" />
          <Line yAxisId="left" type="monotone" dataKey="min" name="Min" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
