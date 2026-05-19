import { Archive, Boxes, Plus, TriangleAlert } from "lucide-react";

import {
  archiveIngredient,
  archiveSupplier,
  createIngredient,
  createInventoryMovement,
  createSupplier,
  updateIngredient,
  updateSupplier,
} from "@/app/actions/inventory";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Ingredient, InventoryMovement, Supplier } from "@/lib/types";

function formatQty(value: number | string, unit?: string) {
  const amount = Number(value);
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(amount);

  return unit ? `${formatted} ${unit}` : formatted;
}

export default async function InventoryPage() {
  const supabase = await createClient();
  const [{ data: suppliers }, { data: ingredients }, { data: stockMovements }, { data: movements }] = await Promise.all([
    supabase.from("suppliers").select("*").order("name"),
    supabase.from("ingredients").select("*, suppliers(*)").order("name"),
    supabase.from("inventory_movements").select("ingredient_id, quantity_delta"),
    supabase
      .from("inventory_movements")
      .select("*, ingredients(name, unit)")
      .order("created_at", { ascending: false })
      .limit(80),
  ]);

  const supplierList = (suppliers ?? []) as Supplier[];
  const ingredientList = (ingredients ?? []) as Ingredient[];
  const movementList = (movements ?? []) as InventoryMovement[];

  const stockByIngredient = new Map<string, number>();

  (stockMovements ?? []).forEach((movement) => {
    stockByIngredient.set(
      movement.ingredient_id,
      (stockByIngredient.get(movement.ingredient_id) ?? 0) + Number(movement.quantity_delta),
    );
  });

  const lowStockIngredients = ingredientList.filter((ingredient) => {
    const currentStock = stockByIngredient.get(ingredient.id) ?? 0;
    return ingredient.is_active && currentStock <= Number(ingredient.min_stock);
  });

  return (
    <div className="grid gap-7">
      <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 sm:p-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
          <Boxes size={14} />
          Inventory
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Bahan baku & stok</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Stok akhir dihitung dari seluruh mutasi stok masuk, keluar, dan adjustment.
        </p>
      </header>

      {lowStockIngredients.length > 0 ? (
        <section className="rounded-3xl border border-red-300/20 bg-red-500/10 p-5 shadow-xl shadow-black/15">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-red-300/10 text-red-200">
              <TriangleAlert size={20} />
            </span>
            <div>
              <h3 className="font-semibold text-red-100">Peringatan stok menipis</h3>
              <p className="mt-1 text-sm leading-6 text-red-100/70">
                {lowStockIngredients.map((ingredient) => ingredient.name).join(", ")}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-xl shadow-black/15">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Bahan baku</h3>
                <p className="mt-1 text-sm text-slate-400">{ingredientList.length} bahan terdaftar</p>
              </div>
              <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
                Stok dari mutasi
              </span>
            </div>

            <div className="grid gap-3">
              {ingredientList.map((ingredient) => {
                const currentStock = stockByIngredient.get(ingredient.id) ?? 0;
                const isLow = ingredient.is_active && currentStock <= Number(ingredient.min_stock);

                return (
                  <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-4" key={ingredient.id}>
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{ingredient.name}</p>
                        <p className="text-sm text-slate-500">
                          {ingredient.suppliers?.name ?? "Tanpa supplier"} · {ingredient.sku ?? "Tanpa SKU"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300">
                          {formatQty(currentStock, ingredient.unit)}
                        </span>
                        {isLow ? (
                          <span className="rounded-full bg-red-300/10 px-3 py-1 text-xs font-semibold text-red-200">
                            Menipis
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <form action={updateIngredient.bind(null, ingredient.id)} className="grid gap-3 md:grid-cols-6">
                      <input name="name" defaultValue={ingredient.name} className="h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm outline-none transition focus:border-amber-300/70 md:col-span-2" />
                      <input name="sku" defaultValue={ingredient.sku ?? ""} placeholder="SKU" className="h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                      <input name="unit" defaultValue={ingredient.unit} placeholder="Unit" className="h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                      <input name="min_stock" type="number" min="0" step="0.001" defaultValue={ingredient.min_stock} className="h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                      <select name="supplier_id" defaultValue={ingredient.supplier_id ?? ""} className="h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm outline-none transition focus:border-amber-300/70">
                        <option value="">Tanpa supplier</option>
                        {supplierList.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))}
                      </select>
                      <div className="flex items-center justify-between gap-3 md:col-span-6">
                        <label className="flex items-center gap-2 text-sm text-slate-300">
                          <input type="checkbox" name="is_active" defaultChecked={ingredient.is_active} className="accent-amber-300" />
                          Aktif
                        </label>
                        <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200">Simpan</button>
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
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-xl shadow-black/15">
            <h3 className="mb-4 text-xl font-semibold text-white">Riwayat mutasi stok</h3>
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/50">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-white/[0.03] text-left text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Waktu</th>
                    <th className="px-4 py-3 font-medium">Bahan</th>
                    <th className="px-4 py-3 font-medium">Tipe</th>
                    <th className="px-4 py-3 text-right font-medium">Delta</th>
                    <th className="px-4 py-3 font-medium">Referensi</th>
                    <th className="px-4 py-3 font-medium">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {movementList.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-4 py-3 text-slate-400">{formatDateTime(movement.created_at)}</td>
                      <td className="px-4 py-3 text-white">{movement.ingredients?.name ?? "Bahan dihapus"}</td>
                      <td className="px-4 py-3 text-slate-300">{movement.movement_type}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${Number(movement.quantity_delta) > 0 ? "text-emerald-200" : "text-red-200"}`}>
                        {formatQty(movement.quantity_delta, movement.ingredients?.unit)}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {movement.reference_type ? `${movement.reference_type}${movement.reference_id ? ` · ${movement.reference_id}` : ""}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{movement.notes ?? "-"}</td>
                    </tr>
                  ))}
                  {movementList.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-400" colSpan={6}>Belum ada mutasi stok.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="grid content-start gap-4">
          <form action={createInventoryMovement} className="rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-xl shadow-black/15">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-white"><Plus size={18} /> Mutasi stok</h3>
            <div className="grid gap-3">
              <select name="ingredient_id" required className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70">
                <option value="">Pilih bahan</option>
                {ingredientList.filter((ingredient) => ingredient.is_active).map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
                ))}
              </select>
              <select name="movement_type" required className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70">
                <option value="in">Stok masuk</option>
                <option value="out">Stok keluar</option>
                <option value="adjustment">Adjustment</option>
              </select>
              <input name="quantity" required type="number" step="0.001" placeholder="Jumlah" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <input name="reference_type" placeholder="Reference type" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <input name="reference_id" placeholder="Reference ID (UUID)" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <input name="notes" placeholder="Catatan" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <button className="rounded-xl bg-amber-300 px-3 py-3 font-semibold text-slate-950 transition hover:bg-amber-200">Catat mutasi</button>
            </div>
          </form>

          <form action={createIngredient} className="rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-xl shadow-black/15">
            <h3 className="mb-4 font-semibold text-white">Bahan baru</h3>
            <div className="grid gap-3">
              <input name="name" required placeholder="Nama bahan" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <input name="sku" placeholder="SKU" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <input name="unit" required placeholder="Unit, contoh: kg" defaultValue="kg" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <input name="min_stock" required type="number" min="0" step="0.001" placeholder="Minimum stok" defaultValue="0" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <select name="supplier_id" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70">
                <option value="">Tanpa supplier</option>
                {supplierList.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" name="is_active" defaultChecked className="accent-amber-300" />
                Aktif
              </label>
              <button className="rounded-xl bg-white px-3 py-3 font-semibold text-slate-950 transition hover:bg-amber-200">Tambah bahan</button>
            </div>
          </form>

          <form action={createSupplier} className="rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-xl shadow-black/15">
            <h3 className="mb-4 font-semibold text-white">Supplier baru</h3>
            <div className="grid gap-3">
              <input name="name" required placeholder="Nama supplier" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <input name="contact_name" placeholder="Kontak" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <input name="phone" placeholder="Telepon" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <input name="address" placeholder="Alamat" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" name="is_active" defaultChecked className="accent-amber-300" />
                Aktif
              </label>
              <button className="rounded-xl bg-white px-3 py-3 font-semibold text-slate-950 transition hover:bg-amber-200">Tambah supplier</button>
            </div>
          </form>

          <div className="rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-xl shadow-black/15">
            <h3 className="mb-4 font-semibold text-white">Supplier</h3>
            <div className="grid gap-3">
              {supplierList.map((supplier) => (
                <form action={updateSupplier.bind(null, supplier.id)} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3" key={supplier.id}>
                  <div className="grid gap-2">
                    <input name="name" defaultValue={supplier.name} className="h-10 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                    <input name="contact_name" defaultValue={supplier.contact_name ?? ""} placeholder="Kontak" className="h-10 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                    <input name="phone" defaultValue={supplier.phone ?? ""} placeholder="Telepon" className="h-10 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                    <input name="address" defaultValue={supplier.address ?? ""} placeholder="Alamat" className="h-10 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-sm text-slate-300">
                        <input type="checkbox" name="is_active" defaultChecked={supplier.is_active} className="accent-amber-300" />
                        Aktif
                      </label>
                      <button className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200">Simpan</button>
                    </div>
                  </div>
                  <button formAction={archiveSupplier.bind(null, supplier.id)} className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-red-300">
                    <Archive size={16} />
                    Nonaktifkan
                  </button>
                </form>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
