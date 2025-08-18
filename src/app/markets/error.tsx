"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="p-6">
      <div className="p-4 border rounded-md bg-red-50">
        <div className="font-medium">Something went wrong</div>
        <div className="text-sm opacity-80 mt-1">{error.message}</div>
        <button onClick={reset} className="mt-3 text-sm underline">Try again</button>
      </div>
    </main>
  );
}
