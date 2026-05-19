import { BarChart3 } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Sale } from "@/lib/types";

export default async function SalesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sales")
    .select("*, sales_items(*, products(name, sku))")
    .order("created_at", { ascending: false })
    .limit(50);

  const sales = (data ?? []) as Sale[];

  return (
    <div className="grid gap-7">
      <PageHeader
        description="Audit transaksi terakhir, detail produk terjual, dan total pembayaran."
        eyebrow="Riwayat"
        icon={BarChart3}
        title="Riwayat penjualan"
      />
      <section className="grid gap-4">
        {sales.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-[#11100d]/90 p-5 text-slate-400 shadow-xl shadow-black/15">
            Belum ada transaksi.
          </p>
        ) : null}
        {sales.map((sale) => (
          <article className="rounded-2xl border border-white/10 bg-[#11100d]/90 p-5 shadow-xl shadow-black/15" key={sale.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-white">{sale.invoice_number}</p>
                <p className="text-sm text-slate-400">{formatDateTime(sale.created_at)}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-lg font-semibold text-amber-200">{formatCurrency(sale.total)}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{sale.payment_method}</p>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="bg-white/[0.03] text-left text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Produk</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-4 py-3 font-medium">Harga</th>
                    <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {(sale.sales_items ?? []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-white">{item.products?.name ?? "Produk dihapus"}</td>
                      <td className="px-4 py-3 text-slate-300">{item.qty}</td>
                      <td className="px-4 py-3 text-slate-300">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3 text-right text-white">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
