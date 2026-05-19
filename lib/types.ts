export type ProductCategory = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string | null;
  category_id: string | null;
  selling_price: number;
  hpp: number;
  is_active: boolean;
  created_at: string;
  product_categories?: ProductCategory | null;
};

export type SalesItem = {
  id: string;
  sale_id: string;
  product_id: string | null;
  qty: number;
  price: number;
  hpp: number;
  subtotal: number;
  created_at: string;
  products?: Pick<Product, "name" | "sku"> | null;
};

export type Sale = {
  id: string;
  invoice_number: string;
  cashier_id: string;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string;
  created_at: string;
  sales_items?: SalesItem[];
};

export type Supplier = {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
};

export type Ingredient = {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  supplier_id: string | null;
  min_stock: number;
  is_active: boolean;
  created_at: string;
  suppliers?: Supplier | null;
};

export type InventoryMovement = {
  id: string;
  ingredient_id: string;
  movement_type: "in" | "out" | "adjustment";
  quantity_delta: number;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  ingredients?: Pick<Ingredient, "name" | "unit"> | null;
};
