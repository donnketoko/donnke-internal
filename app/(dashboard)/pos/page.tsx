import { PosClient } from "@/components/pos/pos-client";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export default async function PosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_categories(*)")
    .eq("is_active", true)
    .order("name");

  const products = (data ?? []) as Product[];

  return (
    <div className="grid gap-7">
      <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 sm:p-6">
        <p className="w-fit rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
          POS
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Transaksi penjualan</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Pilih produk, atur keranjang, lalu simpan transaksi ke riwayat penjualan.
        </p>
      </header>
      <PosClient products={products} />
    </div>
  );
}
