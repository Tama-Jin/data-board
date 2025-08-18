"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  children,
}: { href: string; children: React.ReactNode }) {
  const path = usePathname();
  const active = path === href;
  return (
    <Link
      href={href}
      className={`text-sm px-2 py-1 rounded-md hover:bg-muted ${
        active ? "bg-muted font-medium" : ""
      }`}
    >
      {children}
    </Link>
  );
}
