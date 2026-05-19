"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const ingredientSchema = z.object({
  name: z.string().trim().min(1),
  sku: z.string().trim().optional(),
  unit: z.string().trim().min(1),
  minimum_stock: z.coerce.number().min(0),
  is_active: z.coerce.boolean().optional(),
});

const supplierSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  is_active: z.coerce.boolean().optional(),
});

const movementSchema = z.object({
  ingredient_id: z.string().uuid(),
  type: z.enum(["stock_in", "stock_out", "adjustment_in", "adjustment_out", "waste"]),
  qty: z.coerce.number().positive(),
  unit_cost: z.coerce.number().min(0).default(0),
  reference_type: z.string().trim().optional(),
  reference_id: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().trim().optional(),
});

function signedQty(type: z.infer<typeof movementSchema>["type"], qty: number) {
  if (type === "stock_in" || type === "adjustment_in") {
    return Math.abs(qty);
  }

  return -Math.abs(qty);
}

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id ?? null };
}

export async function createIngredient(formData: FormData) {
  const parsed = ingredientSchema.parse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    unit: formData.get("unit"),
    minimum_stock: formData.get("minimum_stock"),
    is_active: formData.get("is_active") === "on",
  });

  const supabase = await createClient();
  const { error } = await supabase.from("ingredients").insert({
    ...parsed,
    sku: parsed.sku || null,
    is_active: parsed.is_active ?? true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/ingredients");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}

export async function updateIngredient(id: string, formData: FormData) {
  const parsed = ingredientSchema.parse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    unit: formData.get("unit"),
    minimum_stock: formData.get("minimum_stock"),
    is_active: formData.get("is_active") === "on",
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("ingredients")
    .update({
      ...parsed,
      sku: parsed.sku || null,
      is_active: parsed.is_active ?? false,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/ingredients");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}

export async function archiveIngredient(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ingredients").update({ is_active: false }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/ingredients");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}

export async function createSupplier(formData: FormData) {
  const parsed = supplierSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    notes: formData.get("notes") || undefined,
    is_active: formData.get("is_active") === "on",
  });

  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").insert({
    ...parsed,
    phone: parsed.phone || null,
    address: parsed.address || null,
    notes: parsed.notes || null,
    is_active: parsed.is_active ?? true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/suppliers");
}

export async function updateSupplier(id: string, formData: FormData) {
  const parsed = supplierSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    notes: formData.get("notes") || undefined,
    is_active: formData.get("is_active") === "on",
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update({
      ...parsed,
      phone: parsed.phone || null,
      address: parsed.address || null,
      notes: parsed.notes || null,
      is_active: parsed.is_active ?? false,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/suppliers");
}

export async function archiveSupplier(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").update({ is_active: false }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/suppliers");
}

export async function createInventoryMovement(formData: FormData) {
  const parsed = movementSchema.parse({
    ingredient_id: formData.get("ingredient_id"),
    type: formData.get("type"),
    qty: formData.get("qty"),
    unit_cost: formData.get("unit_cost") || 0,
    reference_type: formData.get("reference_type") || undefined,
    reference_id: formData.get("reference_id") || undefined,
    notes: formData.get("notes") || undefined,
  });
  const { supabase, userId } = await getUserId();
  const qty = signedQty(parsed.type, parsed.qty);
  const unitCost = parsed.unit_cost ?? 0;
  const totalCost = Math.abs(qty) * unitCost;

  const { error } = await supabase.from("inventory_movements").insert({
    ingredient_id: parsed.ingredient_id,
    type: parsed.type,
    qty,
    unit_cost: unitCost,
    total_cost: totalCost,
    reference_type: parsed.reference_type || null,
    reference_id: parsed.reference_id || null,
    notes: parsed.notes || null,
    created_by: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/ingredients");
  revalidatePath("/dashboard");
}
