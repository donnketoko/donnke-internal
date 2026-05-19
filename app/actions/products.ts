"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const categorySchema = z.object({
  name: z.string().trim().min(1),
});

const productSchema = z.object({
  name: z.string().trim().min(1),
  sku: z.string().trim().optional(),
  category_id: z.string().uuid().optional().or(z.literal("")),
  selling_price: z.coerce.number().min(0),
  hpp: z.coerce.number().min(0),
  is_active: z.coerce.boolean().optional(),
});

export async function createCategory(formData: FormData) {
  const parsed = categorySchema.parse({
    name: formData.get("name"),
  });

  const supabase = await createClient();
  const { error } = await supabase.from("product_categories").insert(parsed);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/products");
}

export async function createProduct(formData: FormData) {
  const parsed = productSchema.parse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    category_id: formData.get("category_id") || undefined,
    selling_price: formData.get("selling_price"),
    hpp: formData.get("hpp"),
    is_active: formData.get("is_active") === "on",
  });

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    ...parsed,
    sku: parsed.sku || null,
    category_id: parsed.category_id || null,
    is_active: parsed.is_active ?? true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/products");
  revalidatePath("/pos");
}

export async function updateProduct(id: string, formData: FormData) {
  const parsed = productSchema.parse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    category_id: formData.get("category_id") || undefined,
    selling_price: formData.get("selling_price"),
    hpp: formData.get("hpp"),
    is_active: formData.get("is_active") === "on",
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      ...parsed,
      sku: parsed.sku || null,
      category_id: parsed.category_id || null,
      is_active: parsed.is_active ?? false,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/products");
  revalidatePath("/pos");
}

export async function archiveProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/products");
  revalidatePath("/pos");
}
