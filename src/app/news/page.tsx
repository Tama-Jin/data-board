// src/app/news/page.tsx
import { headers } from "next/headers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const revalidate = 300;

function getBaseUrl() {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host  = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

async function getNews() {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/news`, {
    next: { revalidate: 300 },
    cache: "force-cache",
    headers: { "user-agent": "Mozilla/5.0 DataBoard" },
  });
  if (!res.ok) return [];
  const j = await res.json();
  return Array.isArray(j.items) ? j.items : [];
}

export default async function NewsPage() {
  const items = await getNews();

  return (
    <main className="p-6 grid gap-6">
      <Card>
        <CardHeader><CardTitle>Top News (Yahoo!ニュース)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {items.length === 0 ? (
            <div className="text-muted-foreground">ニュースを取得できませんでした。</div>
          ) : (
            <ul className="list-disc pl-5">
              {items.map((it: any) => (
                <li key={it.link}>
                  <a className="underline" href={it.link} target="_blank" rel="noreferrer">
                    {it.title}
                  </a>
                  {it.pubDate ? <span className="text-xs text-muted-foreground ml-2">{it.pubDate}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
