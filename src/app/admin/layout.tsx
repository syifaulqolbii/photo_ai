"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/themes", label: "Tema", icon: "🎨" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [dark, setDark] = useState(false);

  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);

  async function toggleDark() {
    const next = !dark;
    setDark(next);
    await fetch("/api/admin/darkmode", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dark: next }) });
    router.refresh();
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-slate-950">
      <aside className="w-52 flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800">
        <div className="px-5 py-5 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
          <span className="text-base font-black text-gray-800 dark:text-slate-100">📸 Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                path === n.href ? "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800")}>
              <span>{n.icon}</span>{n.label}
            </Link>
          ))}
        </nav>
        {/* pinned bottom — always visible */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-100 dark:border-slate-800 space-y-1">
          <button onClick={toggleDark}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
            {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-100 font-semibold transition">
            ← Kembali ke App
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}