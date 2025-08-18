import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="p-6 grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>USD/JPY</CardTitle></CardHeader><CardContent><Skeleton className="h-8 w-32" /></CardContent></Card>
        <Card><CardHeader><CardTitle>USD/JPY (30d)</CardTitle></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Stock Indexes</CardTitle></CardHeader><CardContent><Skeleton className="h-6 w-40" /></CardContent></Card>
      <Card><CardHeader><CardTitle>Crypto</CardTitle></CardHeader><CardContent><Skeleton className="h-6 w-40" /></CardContent></Card>
    </main>
  );
}
