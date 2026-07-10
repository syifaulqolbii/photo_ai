import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Photobooth",
  description: "Transform your photo with AI magic",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const dark = cookieStore.get("dark_mode")?.value === "1";
  return (
    <html lang="id" className={dark ? "dark" : ""}>
      <body className="min-h-screen bg-pink-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased">{children}</body>
    </html>
  );
}