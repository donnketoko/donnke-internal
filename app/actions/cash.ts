"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const categorySchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(["income", "expense"]),
  is_active: z.coerce.boolean().optional(),
});

const transactionSchema = z.object({
  category_id: z.string().uuid().optional().or(z.literal("")),
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive(),
  payment_method: z.string().trim().min(1),
  reference_type: z.string().trim().optional(),
  reference_id: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().trim().optional(),
  transaction_date: z.string().trim().min(1),
});

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id ?? null };
}

export async function createCashCategory(formData: FormData) {
  const parsed = categorySchema.parse({
    name: formData.get("name"),
    type: formData.get("type"),
    is_active: formData.get("is_active") === "on",
  });

  const supabase = await createClient();
  const { error } = await supabase.from("cash_categories").insert({
    ...parsed,
    is_active: parsed.is_active ?? true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/cash");
}

export async function archiveCashCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("cash_categories").update({ is_active: false }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/cash");
}

export async function createCashTransaction(formData: FormData) {
  const parsed = transactionSchema.parse({
    category_id: formData.get("category_id") || undefined,
    type: formData.get("type"),
    amount: formData.get("amount"),
    payment_method: formData.get("payment_method"),
    reference_type: formData.get("reference_type") || undefined,
    reference_id: formData.get("reference_id") || undefined,
    notes: formData.get("notes") || undefined,
    transaction_date: formData.get("transaction_date"),
  });
  const { supabase, userId } = await getUserId();

  const { error } = await supabase.from("cash_transactions").insert({
    category_id: parsed.category_id || null,
    type: parsed.type,
    amount: parsed.amount,
    payment_method: parsed.payment_method,
    reference_type: parsed.reference_type || null,
    reference_id: parsed.reference_id || null,
    notes: parsed.notes || null,
    transaction_date: parsed.transaction_date,
    created_by: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/cash");
  revalidatePath("/dashboard");
}
