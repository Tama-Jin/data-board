import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function fetchStooqCsv(symbol: string) {
  const res = await fetch(`https://stooq.com/q/d/l/?s=${symbol}&i=d`, {
    headers: { "user-agent": "Mozilla/5.0 DataBoard" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`stooq ${res.status}`);
  return res.text();
}

export async function GET() {
  try {
    const csv = await fetchStooqCsv("usdjpy");
    const lines = csv.trim().split("\n").slice(1); // skip header

    // 
    let latest: number | null = null;
    let date = "";
    for (let i = lines.length - 1; i >= 0; i--) {
      const [d, , , , c] = lines[i].split(",");
      const num = Number(c);
      if (!Number.isNaN(num) && d) {
        latest = num;
        date = d;
        break;
      }
    }

    return NextResponse.json({ date, latest }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { date: "", latest: null, error: String(e) },
      { status: 200 }
    );
  }
}
