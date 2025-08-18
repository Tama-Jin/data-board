// File: src/app/weather/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import WeatherChart from "@/components/charts/WeatherChart";

type Daily = {
  date: string;
  tempMax: number;
  tempMin: number;
  pop: number;
  icon: string;
  humidityAvg: number;
  feelsLikeAvg: number;
};
type WeatherPayload = {
  city: string;
  current:
    | {
        temp: number;
        feels_like: number;
        humidity: number;
        weather: string;
        icon: string;
      }
    | null;
  daily: Daily[];
};

export const revalidate = 0;

async function getWeather(city = "Tokyo"): Promise<WeatherPayload> {
  const isServer = typeof window === "undefined";

  const base = isServer
    ? process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000")
    : "";

  const res = await fetch(`${base}/api/weather?city=${encodeURIComponent(city)}`, {
    cache: "no-store",
    next: { revalidate: 0 },
    headers: { "user-agent": "Mozilla/5.0 DataBoard" },
  });

  return res.ok ? (await res.json()) : { city, current: null, daily: [] };
}

export default async function WeatherPage() {
  const data = await getWeather("Tokyo");

  return (
    <main className="p-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Weather — {data.city}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          {data.current ? (
            <>
              <div>
                Now: {data.current.temp}°C (feels {data.current.feels_like}°C) —{" "}
                {data.current.weather}
              </div>
              <div>Humidity: {data.current.humidity}%</div>
            </>
          ) : (
            <div className="text-muted-foreground">No current weather.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7-Day Outlook</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {data.daily.map((d) => (
            <div key={d.date} className="rounded-2xl border p-3">
              <div className="text-xs text-muted-foreground">{d.date}</div>
              <div className="text-xl font-semibold">
                {d.tempMax}° / {d.tempMin}°
              </div>
              <div className="text-xs">POP: {Math.round(d.pop * 100)}%</div>
              <div className="text-xs">Humidity: {d.humidityAvg}%</div>
              <div className="text-xs">Feels: {d.feelsLikeAvg}°C</div>
              <img
                alt=""
                className="h-10 w-10 mt-1"
                src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Temp & Precip (7d)</CardTitle>
        </CardHeader>
        <CardContent>
          <WeatherChart daily={data.daily} />
        </CardContent>
      </Card>
    </main>
  );
}
