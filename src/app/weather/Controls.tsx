"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Controls() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("city") ?? "Tokyo");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); router.push(`/weather?city=${encodeURIComponent(q)}`); }}
      className="flex gap-2"
    >
      <input
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        className="border rounded px-3 py-2 text-sm w-56"
        placeholder="City (e.g. Seoul,KR)"
      />
      <button className="border rounded px-3 py-2 text-sm" type="submit">Load</button>
    </form>
  );
}
