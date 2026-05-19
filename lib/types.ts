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
