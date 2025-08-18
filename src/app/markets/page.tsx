// src/app/markets/page.tsx
import { Suspense } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import TempLine from "@/components/charts/TempLine";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 300;

/* ---------- Fetch helpers ---------- */
async function fetchStooqCsv(symbol: string) {
  const res = await fetch(`https://stooq.com/q/d/l/?s=${symbol}&i=d`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("stooq fetch failed");
  return res.text();
}

/* ---------- Section 1: USD/JPY ---------- */
async function UsdJpySection() {
  const csv = await fetchStooqCsv("usdjpy");
  const lines = csv.trim().split("\n").slice(1);
  const last = lines.slice(-30);
  const series = last.map((row) => {
    const [date, , , , close] = row.split(",");
    return { day: date.slice(5), temp: Number(close) };
  });
  const latest = series.length ? series[series.length - 1].temp : NaN;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>USD/JPY</CardTitle></CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">Latest</div>
          <div className="text-3xl font-semibold">{isNaN(latest) ? "-" : latest.toFixed(3)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>USD/JPY (30d)</CardTitle></CardHeader>
        <CardContent><TempLine data={series} /></CardContent>
      </Card>
    </div>
  );
}

/* ---------- Section 2: Stock Indexes ---------- */
type Quote = { code: string; name: string; price: number | null };

async function getIndexLast(code: string, name: string): Promise<Quote> {
  const candidates =
    code === "^n225"
      ? ["^n225", "^nkx", "^nky", "n225", "nikkei"]
      : [code];

  for (const sym of candidates) {
    try {
      const res1 = await fetch(
        `https://stooq.com/q/l/?s=${encodeURIComponent(sym)}&i=d`,
        { next: { revalidate: 300 } }
      );
      if (res1.ok) {
        const text = (await res1.text()).trim();
        // ex: "symbol,date,open,high,low,close,volume\n^N225,2025-08-16, ..., 39210.12,0"
        const lines = text.split("\n");
        if (lines.length >= 2) {
          const parts = lines[1].split(",");
          const close = Number(parts[5] ?? parts[4]);
          if (!Number.isNaN(close) && close > 0) {
            return { code, name, price: close };
          }
        }
      }
    } catch { /* */ }

    try {
      const res2 = await fetch(
        `https://stooq.com/q/d/l/?s=${encodeURIComponent(sym)}&i=d`,
        { next: { revalidate: 300 } }
      );
      if (!res2.ok) continue;

      const csv = await res2.text();
      const lines = csv.trim().split("\n").slice(1);
      for (let i = lines.length - 1; i >= 0; i--) {
        const cols = lines[i].split(",");
        const close = Number(cols[4]);
        if (!Number.isNaN(close) && close > 0) {
          return { code, name, price: close };
        }
      }
    } catch { /*  */ }
  }

  return { code, name, price: null };
}


async function IndexSection() {
  const targets: Array<[string, string]> = [
    ["^n225", "Nikkei 225"],
    ["^spx", "S&P 500"],
    ["^dji", "Dow Jones"],
  ];
  const list = await Promise.all(targets.map(([c, n]) => getIndexLast(c, n)));

  return (
    <Card>
      <CardHeader><CardTitle>Stock Indexes</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {list.map((q) => (
          <div key={q.code}>
            <div className="text-xs text-muted-foreground">{q.name}</div>
            <div className="text-2xl font-semibold">
              {q.price == null ? "-" : q.price.toLocaleString()}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ---------- Section 3: Crypto (CoinGecko) ---------- */
type CG = { jpy?: number; usd_24h_change?: number; jpy_24h_change?: number };
async function CryptoSection() {
  const ids = ["bitcoin", "ethereum", "ripple"].join(",");
  const url =
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=jpy&include_24hr_change=true`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  const data = (await res.json()) as Record<string, CG>;

  return (
    <Card>
      <CardHeader><CardTitle>Crypto (CoinGecko)</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["bitcoin", "ethereum", "ripple"].map((id) => {
          const row = data?.[id];
          const jpy = row?.jpy;
          const chg = row?.jpy_24h_change ?? row?.usd_24h_change;
          const sign = chg != null ? (chg >= 0 ? "+" : "") : "";
          return (
            <div key={id}>
              <div className="text-xs capitalize text-muted-foreground">{id}</div>
              <div className="text-2xl font-semibold">
                {jpy == null ? "-" : jpy.toLocaleString()} <span className="text-sm">JPY</span>
              </div>
              <div className={`text-xs ${chg != null && chg >= 0 ? "text-green-600" : "text-red-600"}`}>
                {chg == null ? "" : `${sign}${chg.toFixed(2)}% / 24h`}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ---------- Skeletons ---------- */
function CardSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent><Skeleton className="h-8 w-40" /></CardContent>
    </Card>
  );
}
function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CardSkeleton title="USD/JPY" />
      <CardSkeleton title="USD/JPY (30d)" />
    </div>
  );
}

/* ---------- Page ---------- */
export default function MarketsPage() {
  return (
    <main className="p-6 grid gap-6">
      <Suspense fallback={<GridSkeleton />}>
        <UsdJpySection />
      </Suspense>

      <Suspense fallback={<CardSkeleton title="Stock Indexes" />}>
        <IndexSection />
      </Suspense>

      <Suspense fallback={<CardSkeleton title="Crypto" />}>
        <CryptoSection />
      </Suspense>
    </main>
  );
}
