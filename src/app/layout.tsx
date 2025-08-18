import "./globals.css";
import NavLink from "@/components/NavLink";
import Link from "next/link";

export const metadata = {
  title: { default: "DataBoard", template: "%s | DataBoard" },
  description: "Multi Data Visualization Dashboard (Weather • Markets • News)",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
          <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-2">
            <span className="font-semibold mr-2">DataBoard</span>
            <NavLink href="/">Main</NavLink>
            <NavLink href="/weather">Weather</NavLink>
            <NavLink href="/markets">Markets</NavLink>
            <NavLink href="/news">News</NavLink>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-8 text-xs text-muted-foreground">
          © 2025 DataBoard
        </footer>
      </body>
    </html>
  );
}
