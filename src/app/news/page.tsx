import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const revalidate = 0;

type Item = { title: string; link: string; pubDate?: string };

async function getNews(): Promise<Item[]> {

  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    const res = await fetch(`${base}/api/news`, {
      cache: "no-store",

      headers: { "user-agent": "Mozilla/5.0 DataBoard" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items as Item[]) ?? [];
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const items = await getNews();

  return (
    <main className="p-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Top News (Yahoo!ニュース)</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              ニュースを取得できませんでした。
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((it, i) => (
                <li key={i} className="text-sm">
                  <a className="underline" href={it.link} target="_blank" rel="noreferrer">
                    {it.title}
                  </a>
                  {it.pubDate ? (
                    <span className="ml-2 text-xs text-muted-foreground">{it.pubDate}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
