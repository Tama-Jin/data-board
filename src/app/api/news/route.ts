// src/app/api/news/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TTL = 600;

function parseRss(xml: string) {
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).map((m) => {
    const block = m[1];
    const titleMatch =
      block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
      block.match(/<title>(.*?)<\/title>/);
    const linkMatch = block.match(/<link>(.*?)<\/link>/);
    const pubMatch = block.match(/<pubDate>(.*?)<\/pubDate>/);
    return {
      title: titleMatch ? titleMatch[1] : "Untitled",
      link: linkMatch ? linkMatch[1] : "#",
      pubDate: pubMatch ? pubMatch[1] : ""
    };
  });
  return items;
}

export async function GET() {
  const feeds = [
    "https://news.yahoo.co.jp/rss/topics/top-picks.xml",
    "https://news.yahoo.co.jp/rss/topics/domestic.xml",
    "https://news.yahoo.co.jp/rss/topics/world.xml",
    "https://news.yahoo.co.jp/rss/topics/business.xml",
    "https://news.yahoo.co.jp/rss/topics/it.xml",
    "https://news.yahoo.co.jp/rss/topics/science.xml"
  ];

  const withFallback = (u: string) => [u, `https://r.jina.ai/http/${u}`];
  const urls = feeds.flatMap(withFallback);

  const fetchWithTimeout = async (url: string, ms = 8000) => {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 DataBoard" },
        cache: "force-cache",
        next: { revalidate: TTL },
        signal: ctrl.signal
      });
      if (!res.ok) throw new Error(String(res.status));
      return parseRss(await res.text());
    } catch {
      return [];
    } finally {
      clearTimeout(id);
    }
  };

  const lists = await Promise.all(urls.map((u) => fetchWithTimeout(u)));
  const all = lists.flat();

  // dedupe + sort
  const uniq = Array.from(new Map(all.map((i) => [i.link, i])).values());
  uniq.sort(
    (a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime()
  );
  const items = uniq.slice(0, 25);

  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": `s-maxage=${TTL}, stale-while-revalidate=60` } }
  );
}
