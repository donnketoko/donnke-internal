import { Archive, Plus, Search } from "lucide-react";

import { archiveProduct, createCategory, createProduct, updateProduct } from "@/app/actions/products";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Product, ProductCategory } from "@/lib/types";

export default async function ProductsPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("product_categories").select("*").order("name"),
    supabase
      .from("products")
      .select("*, product_categories(*)")
      .order("created_at", { ascending: false }),
  ]);

  const categoryList = (categories ?? []) as ProductCategory[];
  const productList = (products ?? []) as Product[];

  return (
    <div className="grid gap-7">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            <Search size={14} />
            Produk
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Manajemen produk</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Kelola menu jual, kategori, harga, dan status produk untuk POS.
          </p>
        </div>
        <p className="rounded-2xl border border-white/10 bg-[#0d1017] px-4 py-3 text-sm text-slate-300">
          {productList.length} produk terdaftar
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {productList.map((product) => (
            <article className="rounded-3xl border border-white/10 bg-[#0d1017] p-4 shadow-xl shadow-black/15" key={product.id}>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-white">{product.name}</p>
                  <p className="text-sm text-slate-400">
                    {product.product_categories?.name ?? "Tanpa kategori"} · {product.sku ?? "Tanpa SKU"}
                  </p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${product.is_active ? "bg-emerald-400/10 text-emerald-200" : "bg-slate-700/60 text-slate-300"}`}>
                  {product.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <form action={updateProduct.bind(null, product.id)} className="grid gap-3 md:grid-cols-6">
                <input name="name" defaultValue={product.name} className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70 md:col-span-2" />
                <input name="sku" defaultValue={product.sku ?? ""} placeholder="SKU" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                <select name="category_id" defaultValue={product.category_id ?? ""} className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70">
                  <option value="">Tanpa kategori</option>
                  {categoryList.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <input name="selling_price" type="number" min="0" defaultValue={product.selling_price} className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                <input name="hpp" type="number" min="0" defaultValue={product.hpp} className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                <div className="flex items-center justify-between gap-3 md:col-span-6">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" name="is_active" defaultChecked={product.is_active} className="accent-amber-300" />
                    Aktif
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="hidden text-sm text-slate-400 sm:inline">{formatCurrency(product.selling_price)}</span>
                    <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200">Simpan</button>
                  </div>
                </div>
              </form>
              <form action={archiveProduct.bind(null, product.id)} className="mt-3">
                <button className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-red-300">
                  <Archive size={16} />
                  Nonaktifkan
                </button>
              </form>
            </article>
          ))}
        </div>

        <aside className="grid content-start gap-4">
          <form action={createProduct} className="rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-xl shadow-black/15">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-white"><Plus size={18} /> Produk baru</h3>
            <div className="grid gap-3">
              <input name="name" required placeholder="Nama produk" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <input name="sku" placeholder="SKU" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <select name="category_id" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70">
                <option value="">Tanpa kategori</option>
                {categoryList.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <input name="selling_price" required type="number" min="0" placeholder="Harga jual" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <input name="hpp" required type="number" min="0" placeholder="HPP" className="h-11 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm outline-none transition focus:border-amber-300/70" />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" name="is_active" defaultChecked className="accent-amber-300" />
                Aktif
              </label>
              <button className="rounded-xl bg-amber-300 px-3 py-3 font-semibold text-slate-950 transition hover:bg-amber-200">Tambah produk</button>
            </div>
          </form>

          <form action={createCategory} className="rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-xl shadow-black/15">
            <h3 className="mb-4 font-semibold text-white">Kategori baru</h3>
            <div className="flex gap-2">
              <input name="name" required placeholder="Nama kategori" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm outline-none transition focus:border-amber-300/70" />
              <button className="rounded-xl bg-white px-3 py-2 font-semibold text-slate-950 transition hover:bg-amber-200">Tambah</button>
            </div>
          </form>
        </aside>
      </section>
    </div>
  );
}
