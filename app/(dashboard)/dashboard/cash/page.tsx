import { Archive, Banknote, Plus } from "lucide-react";

import { archiveCashCategory, createCashCategory, createCashTransaction } from "@/app/actions/cash";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { CashCategory, CashTransaction, CashCategoryType } from "@/lib/types";

const typeLabels: Record<CashCategoryType, string> = {
  income: "Kas masuk",
  expense: "Kas keluar",
};

function CashForm({
  categories,
  type,
}: {
  categories: CashCategory[];
  type: CashCategoryType;
}) {
  return (
    <form action={createCashTransaction} className="rounded-2xl border border-white/10 bg-[#11100d]/90 p-5 shadow-xl shadow-black/15">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-white"><Plus size={18} /> {typeLabels[type]}</h3>
      <input type="hidden" name="type" value={type} />
      <div className="grid gap-3">
        <select name="category_id" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70">
          <option value="">Tanpa kategori</option>
          {categories.filter((category) => category.type === type && category.is_active).map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <input name="amount" required type="number" min="1" step="1" placeholder="Nominal" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
        <select name="payment_method" defaultValue="cash" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70">
          <option value="cash">Cash</option>
          <option value="qris">QRIS</option>
          <option value="transfer">Transfer</option>
        </select>
        <input name="transaction_date" required type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
        <input name="reference_type" placeholder="Referensi, contoh: sales" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
        <input name="notes" placeholder="Catatan" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
        <button className="rounded-xl bg-gradient-to-r from-amber-200 to-orange-300 px-3 py-3 font-semibold text-[#1c1206] transition hover:brightness-105">Simpan</button>
      </div>
    </form>
  );
}

export default async function CashPage() {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);

  const [{ data: categoriesData }, { data: transactionsData }, { data: monthData }] = await Promise.all([
    supabase.from("cash_categories").select("*").order("type").order("name"),
    supabase
      .from("cash_transactions")
      .select("*, cash_categories(name, type)")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("cash_transactions")
      .select("type, amount")
      .gte("transaction_date", monthStart)
      .lt("transaction_date", nextMonthStart),
  ]);

  const categories = (categoriesData ?? []) as CashCategory[];
  const transactions = (transactionsData ?? []) as CashTransaction[];
  const monthIncome = (monthData ?? [])
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const monthExpense = (monthData ?? [])
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  return (
    <div className="grid gap-7">
      <PageHeader
        description="Catat kas masuk, kas keluar, kategori, dan saldo bulanan sederhana."
        eyebrow="Kas"
        icon={Banknote}
        title="Kas keuangan"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Banknote} label="Kas masuk bulan ini" value={formatCurrency(monthIncome)} />
        <StatCard icon={Banknote} label="Kas keluar bulan ini" value={formatCurrency(monthExpense)} />
        <StatCard icon={Banknote} label="Saldo bulan ini" value={formatCurrency(monthIncome - monthExpense)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CashForm categories={categories} type="income" />
        <CashForm categories={categories} type="expense" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-white/10 bg-[#11100d]/90 p-5 shadow-xl shadow-black/15">
          <h3 className="mb-4 text-xl font-semibold text-white">Riwayat kas</h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-white/[0.03] text-left text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Tipe</th>
                  <th className="px-4 py-3 text-right font-medium">Nominal</th>
                  <th className="px-4 py-3 font-medium">Metode</th>
                  <th className="px-4 py-3 font-medium">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3 text-slate-400">{formatDateTime(transaction.transaction_date)}</td>
                    <td className="px-4 py-3 text-white">{transaction.cash_categories?.name ?? "Tanpa kategori"}</td>
                    <td className="px-4 py-3 text-slate-300">{typeLabels[transaction.type]}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${transaction.type === "income" ? "text-emerald-200" : "text-red-200"}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{transaction.payment_method}</td>
                    <td className="px-4 py-3 text-slate-400">{transaction.notes ?? "-"}</td>
                  </tr>
                ))}
                {transactions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-400" colSpan={6}>Belum ada transaksi kas.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid content-start gap-4">
          <form action={createCashCategory} className="rounded-2xl border border-white/10 bg-[#11100d]/90 p-5 shadow-xl shadow-black/15">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-white"><Plus size={18} /> Kategori kas</h3>
            <div className="grid gap-3">
              <input name="name" required placeholder="Nama kategori" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <select name="type" defaultValue="expense" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" name="is_active" defaultChecked className="accent-amber-300" />
                Aktif
              </label>
              <button className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-100">Tambah kategori</button>
            </div>
          </form>

          <div className="rounded-2xl border border-white/10 bg-[#11100d]/90 p-5 shadow-xl shadow-black/15">
            <h3 className="mb-4 font-semibold text-white">Kategori aktif</h3>
            <div className="grid gap-2">
              {categories.map((category) => (
                <form action={archiveCashCategory.bind(null, category.id)} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2" key={category.id}>
                  <div>
                    <p className="text-sm font-medium text-white">{category.name}</p>
                    <p className="text-xs text-slate-500">{typeLabels[category.type]} · {category.is_active ? "Aktif" : "Nonaktif"}</p>
                  </div>
                  {category.is_active ? (
                    <button className="text-slate-500 hover:text-red-300" title="Nonaktifkan">
                      <Archive size={16} />
                    </button>
                  ) : null}
                </form>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
