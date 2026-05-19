import { Boxes, Plus } from "lucide-react";
import Link from "next/link";

import { createInventoryMovement } from "@/app/actions/inventory";
import { PageHeader } from "@/components/dashboard/page-header";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Ingredient, InventoryMovement, InventoryMovementType } from "@/lib/types";

const movementLabels: Record<InventoryMovementType, string> = {
  stock_in: "Stok masuk",
  stock_out: "Stok keluar",
  adjustment_in: "Adjustment masuk",
  adjustment_out: "Adjustment keluar",
  waste: "Waste",
};

function formatQty(value: number | string, unit?: string) {
  const amount = Number(value);
  const formatted = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 }).format(amount);

  return unit ? `${formatted} ${unit}` : formatted;
}

function MovementForm({
  ingredients,
  type,
  title,
  allowTypeChoice = false,
}: {
  ingredients: Ingredient[];
  type: InventoryMovementType;
  title: string;
  allowTypeChoice?: boolean;
}) {
  return (
    <form action={createInventoryMovement} className="rounded-2xl border border-white/10 bg-[#11100d]/90 p-5 shadow-xl shadow-black/15">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-white"><Plus size={18} /> {title}</h3>
      {allowTypeChoice ? (
        <select name="type" defaultValue={type} className="mb-3 h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70">
          <option value="adjustment_in">Adjustment masuk</option>
          <option value="adjustment_out">Adjustment keluar</option>
          <option value="waste">Waste</option>
        </select>
      ) : (
        <input type="hidden" name="type" value={type} />
      )}
      <div className="grid gap-3">
        <select name="ingredient_id" required className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70">
          <option value="">Pilih bahan</option>
          {ingredients.map((ingredient) => (
            <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
          ))}
        </select>
        <input name="qty" required type="number" min="0.001" step="0.001" placeholder="Jumlah" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
        <input name="unit_cost" type="number" min="0" step="1" placeholder="Biaya per unit" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
        <input name="reference_type" placeholder="Referensi, contoh: purchase" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
        <input name="notes" placeholder="Catatan" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
        <button className="rounded-xl bg-gradient-to-r from-amber-200 to-orange-300 px-3 py-3 font-semibold text-[#1c1206] transition hover:brightness-105">Catat</button>
      </div>
    </form>
  );
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ ingredient?: string; type?: InventoryMovementType }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: ingredientsData } = await supabase.from("ingredients").select("*").eq("is_active", true).order("name");
  const ingredients = (ingredientsData ?? []) as Ingredient[];

  let movementsQuery = supabase
    .from("inventory_movements")
    .select("*, ingredients(name, unit)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.ingredient) {
    movementsQuery = movementsQuery.eq("ingredient_id", params.ingredient);
  }

  if (params.type) {
    movementsQuery = movementsQuery.eq("type", params.type);
  }

  const { data: movementsData } = await movementsQuery;
  const movements = (movementsData ?? []) as InventoryMovement[];

  return (
    <div className="grid gap-7">
      <PageHeader
        description="Catat setiap stok masuk, keluar, adjustment, dan waste sebagai mutasi bahan."
        eyebrow="Inventory"
        icon={Boxes}
        title="Mutasi stok bahan"
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <MovementForm ingredients={ingredients} title="Stok masuk" type="stock_in" />
        <MovementForm ingredients={ingredients} title="Stok keluar" type="stock_out" />
        <MovementForm allowTypeChoice ingredients={ingredients} title="Adjustment / waste" type="adjustment_in" />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#11100d]/90 p-5 shadow-xl shadow-black/15">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Riwayat mutasi stok</h3>
            <p className="mt-1 text-sm text-slate-400">Stok akhir dihitung dari total qty semua movement.</p>
          </div>
          <form className="grid gap-2 sm:grid-cols-3" action="/dashboard/inventory">
            <select name="ingredient" defaultValue={params.ingredient ?? ""} className="h-10 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70">
              <option value="">Semua bahan</option>
              {ingredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
              ))}
            </select>
            <select name="type" defaultValue={params.type ?? ""} className="h-10 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70">
              <option value="">Semua tipe</option>
              {Object.entries(movementLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-100">Filter</button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
          <table className="w-full min-w-[840px] text-sm">
            <thead className="bg-white/[0.03] text-left text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Waktu</th>
                <th className="px-4 py-3 font-medium">Bahan</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 text-right font-medium">Qty</th>
                <th className="px-4 py-3 text-right font-medium">Biaya</th>
                <th className="px-4 py-3 font-medium">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td className="px-4 py-3 text-slate-400">{formatDateTime(movement.created_at)}</td>
                  <td className="px-4 py-3 text-white">{movement.ingredients?.name ?? "Bahan dihapus"}</td>
                  <td className="px-4 py-3 text-slate-300">{movementLabels[movement.type]}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${Number(movement.qty) >= 0 ? "text-emerald-200" : "text-red-200"}`}>
                    {formatQty(movement.qty, movement.ingredients?.unit)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">{formatCurrency(movement.total_cost)}</td>
                  <td className="px-4 py-3 text-slate-400">{movement.notes ?? "-"}</td>
                </tr>
              ))}
              {movements.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={6}>
                    Belum ada mutasi. Tambahkan bahan di <Link className="text-amber-200 hover:text-amber-100" href="/dashboard/ingredients">Bahan baku</Link>.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
