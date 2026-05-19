import { ShoppingCart } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
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
      <PageHeader
        description="Pilih produk, atur keranjang, lalu simpan transaksi ke riwayat penjualan."
        eyebrow="POS"
        icon={ShoppingCart}
        title="Transaksi penjualan"
      />
      <PosClient products={products} />
    </div>
  );
}
