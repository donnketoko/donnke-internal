"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  qty: z.number().int().positive(),
});

const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  discount: z.number().min(0).default(0),
  payment_method: z.enum(["cash", "qris", "transfer"]).default("cash"),
});

export async function checkoutSale(input: unknown) {
  const parsed = checkoutSchema.parse(input);
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, message: "Sesi login tidak valid." };
  }

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();

  if (!profile) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: user.email?.split("@")[0] ?? null,
      role: "staff",
    });

    if (profileError) {
      return { ok: false, message: profileError.message };
    }
  }

  const productIds = parsed.items.map((item) => item.product_id);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, selling_price, hpp, is_active")
    .in("id", productIds);

  if (productsError || !products) {
    return { ok: false, message: productsError?.message ?? "Produk tidak ditemukan." };
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const saleItems = [];

  for (const item of parsed.items) {
    const product = productMap.get(item.product_id);

    if (!product || !product.is_active) {
      return { ok: false, message: "Produk tidak aktif atau tidak ditemukan." };
    }

    const price = Number(product.selling_price);
    const hpp = Number(product.hpp);

    saleItems.push({
      product_id: item.product_id,
      qty: item.qty,
      price,
      hpp,
      subtotal: price * item.qty,
    });
  }

  const subtotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = Math.min(parsed.discount, subtotal);
  const total = subtotal - discount;
  const invoiceNumber = `DNK-${Date.now()}`;

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      invoice_number: invoiceNumber,
      cashier_id: user.id,
      subtotal,
      discount,
      total,
      payment_method: parsed.payment_method,
    })
    .select("id, invoice_number")
    .single();

  if (saleError || !sale) {
    return { ok: false, message: saleError?.message ?? "Gagal menyimpan transaksi." };
  }

  const { error: itemsError } = await supabase.from("sales_items").insert(
    saleItems.map((item) => ({
      ...item,
      sale_id: sale.id,
    })),
  );

  if (itemsError) {
    return { ok: false, message: itemsError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sales");

  return { ok: true, message: `Transaksi ${sale.invoice_number} tersimpan.` };
}
