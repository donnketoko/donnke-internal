import { Archive, Plus, Truck } from "lucide-react";

import { archiveSupplier, createSupplier, updateSupplier } from "@/app/actions/inventory";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import type { Supplier } from "@/lib/types";

export default async function SuppliersPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("suppliers").select("*").order("name");
  const suppliers = (data ?? []) as Supplier[];

  return (
    <div className="grid gap-7">
      <PageHeader
        description="Kelola kontak supplier bahan baku dan catatan pembelian."
        eyebrow="Supplier"
        icon={Truck}
        title="Supplier"
      />

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {suppliers.map((supplier) => (
            <article className="rounded-2xl border border-white/10 bg-[#11100d]/90 p-4 shadow-xl shadow-black/15" key={supplier.id}>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-white">{supplier.name}</p>
                  <p className="text-sm text-slate-500">{supplier.phone ?? "Tanpa telepon"}</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${supplier.is_active ? "bg-emerald-400/10 text-emerald-200" : "bg-slate-700/60 text-slate-300"}`}>
                  {supplier.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <form action={updateSupplier.bind(null, supplier.id)} className="grid gap-3 md:grid-cols-2">
                <input name="name" defaultValue={supplier.name} className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                <input name="phone" defaultValue={supplier.phone ?? ""} placeholder="Telepon" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
                <input name="address" defaultValue={supplier.address ?? ""} placeholder="Alamat" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70 md:col-span-2" />
                <input name="notes" defaultValue={supplier.notes ?? ""} placeholder="Catatan" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70 md:col-span-2" />
                <div className="flex items-center justify-between gap-3 md:col-span-2">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" name="is_active" defaultChecked={supplier.is_active} className="accent-amber-300" />
                    Aktif
                  </label>
                  <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-100">Simpan</button>
                </div>
              </form>
              <form action={archiveSupplier.bind(null, supplier.id)} className="mt-3">
                <button className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-red-300">
                  <Archive size={16} />
                  Nonaktifkan
                </button>
              </form>
            </article>
          ))}
          {suppliers.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-[#11100d]/90 p-5 text-slate-400">Belum ada supplier.</p>
          ) : null}
        </div>

        <form action={createSupplier} className="h-fit rounded-2xl border border-white/10 bg-[#11100d]/90 p-5 shadow-xl shadow-black/15">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white"><Plus size={18} /> Supplier baru</h3>
          <div className="grid gap-3">
            <input name="name" required placeholder="Nama supplier" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
            <input name="phone" placeholder="Telepon" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
            <input name="address" placeholder="Alamat" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
            <input name="notes" placeholder="Catatan" className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-sm outline-none transition focus:border-amber-300/70" />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" name="is_active" defaultChecked className="accent-amber-300" />
              Aktif
            </label>
            <button className="rounded-xl bg-gradient-to-r from-amber-200 to-orange-300 px-3 py-3 font-semibold text-[#1c1206] transition hover:brightness-105">Tambah supplier</button>
          </div>
        </form>
      </section>
    </div>
  );
}
