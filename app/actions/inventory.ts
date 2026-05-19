"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const supplierSchema = z.object({
  name: z.string().trim().min(1),
  contact_name: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  is_active: z.coerce.boolean().optional(),
});

const ingredientSchema = z.object({
  name: z.string().trim().min(1),
  sku: z.string().trim().optional(),
  unit: z.string().trim().min(1),
  supplier_id: z.string().uuid().optional().or(z.literal("")),
  min_stock: z.coerce.number().min(0),
  is_active: z.coerce.boolean().optional(),
});

const movementSchema = z.object({
  ingredient_id: z.string().uuid(),
  movement_type: z.enum(["in", "out", "adjustment"]),
  quantity: z.coerce.number(),
  reference_type: z.string().trim().optional(),
  reference_id: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().trim().optional(),
});

export async function createSupplier(formData: FormData) {
  const parsed = supplierSchema.parse({
    name: formData.get("name"),
    contact_name: formData.get("contact_name") || undefined,
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    is_active: formData.get("is_active") === "on",
  });

  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").insert({
    ...parsed,
    contact_name: parsed.contact_name || null,
    phone: parsed.phone || null,
    address: parsed.address || null,
    is_active: parsed.is_active ?? true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/inventory");
}

export async function updateSupplier(id: string, formData: FormData) {
  const parsed = supplierSchema.parse({
    name: formData.get("name"),
    contact_name: formData.get("contact_name") || undefined,
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    is_active: formData.get("is_active") === "on",
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update({
      ...parsed,
      contact_name: parsed.contact_name || null,
      phone: parsed.phone || null,
      address: parsed.address || null,
      is_active: parsed.is_active ?? false,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/inventory");
}

export async function archiveSupplier(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").update({ is_active: false }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/inventory");
}

export async function createIngredient(formData: FormData) {
  const parsed = ingredientSchema.parse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    unit: formData.get("unit"),
    supplier_id: formData.get("supplier_id") || undefined,
    min_stock: formData.get("min_stock"),
    is_active: formData.get("is_active") === "on",
  });

  const supabase = await createClient();
  const { error } = await supabase.from("ingredients").insert({
    ...parsed,
    sku: parsed.sku || null,
    supplier_id: parsed.supplier_id || null,
    is_active: parsed.is_active ?? true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/inventory");
}

export async function updateIngredient(id: string, formData: FormData) {
  const parsed = ingredientSchema.parse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    unit: formData.get("unit"),
    supplier_id: formData.get("supplier_id") || undefined,
    min_stock: formData.get("min_stock"),
    is_active: formData.get("is_active") === "on",
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("ingredients")
    .update({
      ...parsed,
      sku: parsed.sku || null,
      supplier_id: parsed.supplier_id || null,
      is_active: parsed.is_active ?? false,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/inventory");
}

export async function archiveIngredient(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ingredients").update({ is_active: false }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/inventory");
}

export async function createInventoryMovement(formData: FormData) {
  const parsed = movementSchema.parse({
    ingredient_id: formData.get("ingredient_id"),
    movement_type: formData.get("movement_type"),
    quantity: formData.get("quantity"),
    reference_type: formData.get("reference_type") || undefined,
    reference_id: formData.get("reference_id") || undefined,
    notes: formData.get("notes") || undefined,
  });

  let quantityDelta = parsed.quantity;

  if (parsed.movement_type === "in") {
    quantityDelta = Math.abs(parsed.quantity);
  }

  if (parsed.movement_type === "out") {
    quantityDelta = -Math.abs(parsed.quantity);
  }

  if (quantityDelta === 0) {
    throw new Error("Jumlah mutasi tidak boleh 0.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("inventory_movements").insert({
    ingredient_id: parsed.ingredient_id,
    movement_type: parsed.movement_type,
    quantity_delta: quantityDelta,
    reference_type: parsed.reference_type || null,
    reference_id: parsed.reference_id || null,
    notes: parsed.notes || null,
    created_by: user?.id ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/inventory");
}
