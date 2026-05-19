import { Database } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TestSupabasePage() {
  const supabase = await createClient();
  const { error } = await supabase.from("product_categories").select("id", { count: "exact", head: true });
  const isConnected = !error;

  return (
    <main className="grid min-h-screen place-items-center bg-[#080706] bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_34rem)] px-4 py-10 text-slate-100">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#11100d]/90 p-6 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-amber-300/10 text-amber-100">
            <Database size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">Supabase</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Connection test</h1>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-sm text-slate-400">Status</p>
          <p className={`mt-2 text-lg font-semibold ${isConnected ? "text-emerald-200" : "text-red-200"}`}>
            {isConnected ? "Connected" : "Not connected"}
          </p>
          {error ? <p className="mt-3 text-sm leading-6 text-red-200/80">{error.message}</p> : null}
        </div>
      </section>
    </main>
  );
}
