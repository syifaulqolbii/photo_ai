"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setError(error.message ?? "Login gagal");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg shadow-pink-100 border border-pink-50">
        <div className="mb-6 text-center">
          <span className="text-4xl">📸</span>
          <h1 className="mt-2 text-xl font-black text-gray-800">AI Photobooth</h1>
          <p className="mt-1 text-sm text-gray-400">Masuk untuk melanjutkan</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-500">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border-2 border-gray-100 px-4 py-2.5 text-sm outline-none focus:border-pink-300 transition"
              placeholder="kamu@email.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-500">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border-2 border-gray-100 px-4 py-2.5 text-sm outline-none focus:border-pink-300 transition"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-xs font-medium text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 py-3 text-sm font-black text-white shadow-md shadow-pink-200 hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}