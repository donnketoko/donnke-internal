import { Banknote, Leaf, Package, ReceiptText, ShoppingCart, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayDate = todayStart.toISOString().slice(0, 10);
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().slice(0, 10);

  const [
    { count: productCount },
    { data: salesToday },
    { count: transactionCount },
    { data: ingredients },
    { data: inventoryMovements },
    { data: cashToday },
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("sales").select("total").gte("created_at", todayStart.toISOString()),
    supabase.from("sales").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    supabase.from("ingredients").select("id, minimum_stock, is_active").eq("is_active", true),
    supabase.from("inventory_movements").select("ingredient_id, qty"),
    supabase.from("cash_transactions").select("type, amount").gte("transaction_date", todayDate).lt("transaction_date", tomorrowDate),
  ]);

  const revenueToday = (salesToday ?? []).reduce((sum, sale) => sum + Number(sale.total), 0);
  const stockByIngredient = new Map<string, number>();

  (inventoryMovements ?? []).forEach((movement) => {
    stockByIngredient.set(
      movement.ingredient_id,
      (stockByIngredient.get(movement.ingredient_id) ?? 0) + Number(movement.qty),
    );
  });

  const lowStockCount = (ingredients ?? []).filter((ingredient) => {
    const currentStock = stockByIngredient.get(ingredient.id) ?? 0;
    return ingredient.is_active && currentStock <= Number(ingredient.minimum_stock);
  }).length;
  const cashIncomeToday = (cashToday ?? [])
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const cashExpenseToday = (cashToday ?? [])
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const cards = [
    { label: "Produk aktif", value: productCount ?? 0, icon: Package },
    { label: "Transaksi hari ini", value: transactionCount ?? 0, icon: ReceiptText },
    { label: "Penjualan hari ini", value: formatCurrency(revenueToday), icon: ShoppingCart },
    { label: "Bahan stok menipis", value: lowStockCount, icon: Leaf },
    { label: "Kas masuk hari ini", value: formatCurrency(cashIncomeToday), icon: Banknote },
    { label: "Kas keluar hari ini", value: formatCurrency(cashExpenseToday), icon: Banknote },
    { label: "Saldo kas hari ini", value: formatCurrency(cashIncomeToday - cashExpenseToday), icon: Banknote },
  ];

  return (
    <div className="grid gap-7">
      <PageHeader
        action={
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
            Mode kerja internal
          </div>
        }
        description="Ringkasan cepat untuk produk aktif, transaksi, dan omzet harian."
        eyebrow="Dashboard"
        icon={Sparkles}
        title="Operasional hari ini"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard icon={card.icon} key={card.label} label={card.label} value={card.value} />
        ))}
      </section>
    </div>
  );
}
