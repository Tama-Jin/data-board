"use client";
import { useEffect, useRef, useState } from "react";

const KEY = "databoard:memo";

export default function MemoBox() {
  const [text, setText] = useState("");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved != null) setText(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try { localStorage.setItem(KEY, text); } catch {}
    }, 500);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [text]);

  return (
    <textarea
      className="w-full min-h-[220px] rounded-md border p-3 text-sm"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="メモを入力すると自動的に保存されます（ブラウザのローカルストレージ）"
    />
  );
}
