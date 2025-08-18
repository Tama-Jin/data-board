// src/app/api/weather/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TTL = 600;

function ymd(s: number, tz = 0) {
  const d = new Date((s + tz) * 1000);
  return d.toISOString().slice(0, 10);
}
const mode = (a: string[]) =>
  Array.from(a.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>()))
    .sort((x, y) => y[1] - x[1])[0][0];

export async function GET(req: Request) {
  const api = (process.env.OWM_API_KEY ?? "").trim();
  if (!api) {
    return NextResponse.json(
      { error: "OWM_API_KEY missing", current: null, daily: [] },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const city = (searchParams.get("city") || "Tokyo").trim();
  const ua = { "user-agent": "Mozilla/5.0 DataBoard" };

  const f = (url: string) =>
    fetch(url, { headers: ua, cache: "force-cache", next: { revalidate: TTL } });

  const geo = async (q: string) => {
    const r = await f(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${api}`
    );
    return { ok: r.ok, st: r.status, body: await r.json() };
  };

  let g = await geo(city);
  if ((!g.ok || !Array.isArray(g.body) || g.body.length === 0) && !/,/.test(city)) {
    g = await geo(`${city},JP`);
  }

  let lat: number | null = null,
    lon: number | null = null;
  if (Array.isArray(g.body) && g.body.length) {
    lat = g.body[0].lat;
    lon = g.body[0].lon;
  } else if (/^tokyo/i.test(city)) {
    lat = 35.6895;
    lon = 139.6917; 
  }
  if (lat == null || lon == null) {
    return NextResponse.json({ city, error: "Geocoding failed", g, current: null, daily: [] });
  }

  const curRes = await f(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${api}`
  );
  const fcRes = await f(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${api}`
  );

  const current = await curRes.json();
  const fc = await fcRes.json();

  if (!curRes.ok || !fcRes.ok) {
    const status = !curRes.ok ? curRes.status : fcRes.status;
    return NextResponse.json(
      {
        city,
        error: "OWM error",
        status,
        currentRaw: current,
        forecastRaw: fc,
        current: null,
        daily: []
      },
      { status: 502 }
    );
  }

  const tz = current?.timezone ?? 0;
  const map = new Map<
    string,
    { max: number; min: number; pops: number[]; icons: string[]; hum: number[]; feels: number[] }
  >();

  for (const row of (fc.list as any[]) ?? []) {
    const d = ymd(row.dt, tz);
    const max = row.main?.temp_max ?? row.main?.temp;
    const min = row.main?.temp_min ?? row.main?.temp;
    if (max == null || min == null) continue;
    const pop = row.pop ?? 0,
      icon = row.weather?.[0]?.icon ?? "01d";
    const hum = row.main?.humidity ?? 0,
      feels = row.main?.feels_like ?? row.main?.temp;

    if (!map.has(d))
      map.set(d, { max: -Infinity, min: Infinity, pops: [], icons: [], hum: [], feels: [] });
    const acc = map.get(d)!;
    acc.max = Math.max(acc.max, max);
    acc.min = Math.min(acc.min, min);
    acc.pops.push(pop);
    acc.icons.push(icon);
    acc.hum.push(hum);
    acc.feels.push(feels);
  }

  const daily = Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(0, 7)
    .map(([date, v]) => ({
      date,
      tempMax: Math.round(v.max * 10) / 10,
      tempMin: Math.round(v.min * 10) / 10,
      pop: Math.round((v.pops.reduce((s, x) => s + x, 0) / v.pops.length) * 100) / 100,
      icon: mode(v.icons),
      humidityAvg: Math.round(v.hum.reduce((s, x) => s + x, 0) / v.hum.length),
      feelsLikeAvg: Math.round((v.feels.reduce((s, x) => s + x, 0) / v.feels.length) * 10) / 10
    }));

  const res = NextResponse.json(
    {
      city,
      current: {
        temp: current.main?.temp ?? null,
        feels_like: current.main?.feels_like ?? null,
        humidity: current.main?.humidity ?? null,
        weather: current.weather?.[0]?.main ?? "",
        icon: current.weather?.[0]?.icon ?? "01d"
      },
      daily
    },
    {
      headers: { "Cache-Control": `s-maxage=${TTL}, stale-while-revalidate=60` }
    }
  );
  return res;
}
