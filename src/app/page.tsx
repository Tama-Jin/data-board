import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MemoBox from "@/components/MemoBox";
import { headers } from "next/headers"; // ✅ 추가

export const revalidate = 60;

async function getWeatherSummary() {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&daily=temperature_2m_max&timezone=auto";
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    maxToday: data?.daily?.temperature_2m_max?.[0] as number | undefined,
  };
}

// USD/JPY
async function getUsdJpyLatest() {
  // ✅ 배포/프리뷰/로컬 모두에서 현재 요청의 호스트/프로토콜로 베이스 구성
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host") ?? "localhost:3000";
  const base: string = `${proto}://${host}`;

  const res = await fetch(`${base}/api/usdjpy`, {
    cache: "no-store",
    headers: { "user-agent": "Mozilla/5.0 DataBoard" },
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { date?: string; latest?: number | null };
  return { date: data.date ?? "", usdJpy: data.latest ?? undefined };
}

export default async function Home() {
  const [wx, fx] = await Promise.all([getWeatherSummary(), getUsdJpyLatest()]);

  return (
    <main className="p-6 grid gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Weather (Tokyo)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Max Today</div>
            <div className="text-2xl font-semibold">
              {wx?.maxToday !== undefined ? `${wx.maxToday}℃` : "-"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>USD/JPY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {fx?.date ? `As of ${fx.date}` : "Latest"}
            </div>
            <div className="text-2xl font-semibold">
              {fx?.usdJpy !== undefined ? fx.usdJpy.toFixed(3) : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Memo</CardTitle>
        </CardHeader>
        <CardContent>
          <MemoBox />
        </CardContent>
      </Card>
    </main>
  );
}
