import { Archive, Leaf, Plus, TriangleAlert } from "lucide-react";

import { archiveIngredient, createIngredient, updateIngredient } from "@/app/actions/inventory";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import type { Ingredient } from "@/lib/types";

function formatQty(value: number | string, unit?: string) {
  const amount = Number(value);
  const formatted = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 }).format(amount);

  return unit ? `${formatted} ${unit}` : formatted;
}

export default async function IngredientsPage() {
  const supabase = await createClient();
  const [{ data: ingredients }, { data: movements }] = await Promise.all([
    supabase.from("ingredients").select("*").order("name"),
    supabase.from("inventory_movements").select("ingredient_id, qty"),
  ]);

  const ingredientList = (ingredients ?? []) as Ingredient[];
  const stockByIngredient = new Map<string, number>();

  (movements ?? []).forEach((movement) => {
    stockByIngredient.set(
      movement.ingredient_id,
      (stockByIngredient.get(movement.ingredient_id) ?? 0) + Number(movement.qty),
    );
  });

  return (
    <div className="grid gap-7">
      <PageHeader
        description="Kelola bahan baku, satuan, minimum stok, dan pantau stok akhir dari mutasi."
        eyebrow="Bahan"
        icon={Leaf}
        title="Bahan baku"
      />

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {ingredientList.map((ingredient) => {
            const currentStock = stockByIngredient.get(ingredient.id) ?? 0;
            const isLow = ingredient.is_active && currentStock <= Number(ingredient.minimum_stock);

            return (
              <article className="rounded-2xl border border-white/10 bg-[#11100d]/90 p-4 shadow-xl shadow-black/15" key={ingredient.id}>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">{ingredient.name}</p>
                    <p className="text-sm text-slate-500">{ingredient.sku ?? "Tanpa SKU"} · {ingredient.unit}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300">
                      Stok {formatQty(currentStock, ingredient.unit)}
                    </span>
                    <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100">
                      Min {formatQty(ingredient.minimum_stock, ingredient.unit)}
                    </span>
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-300/10 px-3 py-1 text-xs font-semibold text-red-200">
                        <TriangleAlert size={13} />
                        Menipis
                      </span>
                    ) : null}
                  </div>
                </div>
                <form action={updateIngredient.bind(null, ingredient.id)} className="grid gap-3 md:grid-cols-5">
                  <input name="name" defaultValue={ingredient.name} className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70 md:col-span-2" />
                  <input name="sku" defaultValue={ingredient.sku ?? ""} placeholder="SKU" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                  <input name="unit" defaultValue={ingredient.unit} placeholder="Unit" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                  <input name="minimum_stock" type="number" min="0" step="0.001" defaultValue={ingredient.minimum_stock} className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                  <div className="flex items-center justify-between gap-3 md:col-span-5">
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input type="checkbox" name="is_active" defaultChecked={ingredient.is_active} className="accent-amber-300" />
                      Aktif
                    </label>
                    <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-100">Simpan</button>
                  </div>
                </form>
                <form action={archiveIngredient.bind(null, ingredient.id)} className="mt-3">
                  <button className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-red-300">
                    <Archive size={16} />
                    Nonaktifkan
                  </button>
                </form>
              </article>
            );
          })}
          {ingredientList.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-[#11100d]/90 p-5 text-slate-400">Belum ada bahan baku.</p>
          ) : null}
        </div>

        <form action={createIngredient} className="h-fit rounded-2xl border border-white/10 bg-[#11100d]/90 p-5 shadow-xl shadow-black/15">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white"><Plus size={18} /> Bahan baru</h3>
          <div className="grid gap-3">
            <input name="name" required placeholder="Nama bahan" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
            <input name="sku" placeholder="SKU" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
            <input name="unit" required defaultValue="kg" placeholder="Unit" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
            <input name="minimum_stock" required type="number" min="0" step="0.001" defaultValue="0" placeholder="Minimum stok" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" name="is_active" defaultChecked className="accent-amber-300" />
              Aktif
            </label>
            <button className="rounded-xl bg-gradient-to-r from-amber-200 to-orange-300 px-3 py-3 font-semibold text-[#1c1206] transition hover:brightness-105">Tambah bahan</button>
          </div>
        </form>
      </section>
    </div>
  );
}
