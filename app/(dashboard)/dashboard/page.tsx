import { Package, ReceiptText, ShoppingCart, Sparkles } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [{ count: productCount }, { data: salesToday }, { count: transactionCount }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("sales").select("total").gte("created_at", todayStart.toISOString()),
    supabase.from("sales").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
  ]);

  const revenueToday = (salesToday ?? []).reduce((sum, sale) => sum + Number(sale.total), 0);

  const cards = [
    { label: "Produk aktif", value: productCount ?? 0, icon: Package },
    { label: "Transaksi hari ini", value: transactionCount ?? 0, icon: ReceiptText },
    { label: "Penjualan hari ini", value: formatCurrency(revenueToday), icon: ShoppingCart },
  ];

  return (
    <div className="grid gap-7">
      <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
              <Sparkles size={14} />
              Dashboard
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Operasional hari ini
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Ringkasan cepat untuk produk aktif, transaksi, dan omzet harian.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0d1017] px-4 py-3 text-sm text-slate-300">
            Mode kerja internal
          </div>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article className="rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-xl shadow-black/15" key={card.label}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{card.label}</p>
                <span className="grid size-10 place-items-center rounded-2xl bg-amber-300/10 text-amber-200">
                  <Icon size={20} />
                </span>
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-tight text-white">{card.value}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
