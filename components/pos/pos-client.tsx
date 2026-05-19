"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { checkoutSale } from "@/app/actions/sales";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";

type CartLine = {
  product: Product;
  qty: number;
};

export function PosClient({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subtotal = useMemo(
    () => cart.reduce((sum, line) => sum + Number(line.product.selling_price) * line.qty, 0),
    [cart],
  );
  const safeDiscount = Math.min(discount, subtotal);
  const total = subtotal - safeDiscount;

  function addProduct(product: Product) {
    setMessage(null);
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);

      if (existing) {
        return current.map((line) =>
          line.product.id === product.id ? { ...line, qty: line.qty + 1 } : line,
        );
      }

      return [...current, { product, qty: 1 }];
    });
  }

  function updateQty(productId: string, qty: number) {
    setCart((current) =>
      current
        .map((line) => (line.product.id === productId ? { ...line, qty } : line))
        .filter((line) => line.qty > 0),
    );
  }

  function checkout() {
    setMessage(null);
    startTransition(async () => {
      const result = await checkoutSale({
        discount: safeDiscount,
        payment_method: paymentMethod,
        items: cart.map((line) => ({
          product_id: line.product.id,
          qty: line.qty,
        })),
      });

      setMessage(result.message);

      if (result.ok) {
        setCart([]);
        setDiscount(0);
      }
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_390px]">
      <section className="grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <button
            className="group min-h-36 rounded-2xl border border-white/10 bg-[#11100d]/90 p-4 text-left shadow-xl shadow-black/15 transition hover:-translate-y-0.5 hover:border-amber-300/50 hover:bg-[#17130f]"
            key={product.id}
            onClick={() => addProduct(product)}
            type="button"
          >
            <p className="font-semibold text-white transition group-hover:text-amber-100">{product.name}</p>
            <p className="mt-1 text-sm text-slate-500">
              {product.product_categories?.name ?? "Tanpa kategori"}
            </p>
            <p className="mt-6 text-lg font-semibold text-amber-300">
              {formatCurrency(product.selling_price)}
            </p>
          </button>
        ))}
      </section>

      <aside className="rounded-2xl border border-white/10 bg-[#11100d]/95 p-5 shadow-2xl shadow-black/20 lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Keranjang</h3>
          <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
            {cart.length} item
          </span>
        </div>
        <div className="mt-4 grid gap-3">
          {cart.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 text-sm leading-6 text-slate-400">
              Pilih produk untuk mulai transaksi.
            </p>
          ) : null}
          {cart.map((line) => (
            <div className="rounded-2xl border border-white/10 bg-black/25 p-3" key={line.product.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{line.product.name}</p>
                  <p className="text-sm text-slate-500">{formatCurrency(line.product.selling_price)}</p>
                </div>
                <button
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-red-300"
                  onClick={() => updateQty(line.product.id, 0)}
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="rounded-xl bg-white/[0.06] p-2 transition hover:bg-white/[0.1]" onClick={() => updateQty(line.product.id, line.qty - 1)} type="button">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-semibold">{line.qty}</span>
                  <button className="rounded-xl bg-white/[0.06] p-2 transition hover:bg-white/[0.1]" onClick={() => updateQty(line.product.id, line.qty + 1)} type="button">
                    <Plus size={14} />
                  </button>
                </div>
                <p className="font-semibold text-white">
                  {formatCurrency(Number(line.product.selling_price) * line.qty)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 border-t border-white/10 pt-4">
          <label className="grid gap-2 text-sm text-slate-300">
            Diskon
            <input
              className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 outline-none transition focus:border-amber-300/70"
              min="0"
              onChange={(event) => setDiscount(Number(event.target.value))}
              type="number"
              value={discount}
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Metode pembayaran
            <select
              className="h-11 rounded-xl border border-white/10 bg-black/25 px-3 outline-none transition focus:border-amber-300/70"
              onChange={(event) => setPaymentMethod(event.target.value)}
              value={paymentMethod}
            >
              <option value="cash">Cash</option>
              <option value="qris">QRIS</option>
              <option value="transfer">Transfer</option>
            </select>
          </label>
          <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Diskon</span>
              <span>{formatCurrency(safeDiscount)}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-semibold text-white">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          {message ? <p className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-slate-300">{message}</p> : null}
          <button
            className="rounded-xl bg-gradient-to-r from-amber-200 to-orange-300 px-4 py-3 font-semibold text-[#1c1206] shadow-lg shadow-orange-950/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={cart.length === 0 || isPending}
            onClick={checkout}
            type="button"
          >
            {isPending ? "Menyimpan..." : "Simpan transaksi"}
          </button>
        </div>
      </aside>
    </div>
  );
}
