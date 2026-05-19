"use client";

import { BarChart3, Boxes, CircleDot, LayoutDashboard, LogOut, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/actions/auth";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Produk", icon: Package },
  { href: "/inventory", label: "Stok", icon: Boxes },
  { href: "/pos", label: "POS", icon: ShoppingCart },
  { href: "/sales", label: "Riwayat", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex border-white/10 bg-[#0d1017]/95 md:sticky md:top-0 md:min-h-screen md:w-72 md:flex-col md:border-r">
      <div className="hidden border-b border-white/10 p-6 md:block">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-amber-300 text-slate-950 shadow-lg shadow-amber-950/30">
            <CircleDot size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">Donnke</p>
            <h1 className="mt-1 text-lg font-semibold text-white">Internal</h1>
          </div>
        </div>
        <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-slate-400">
          Bakery operations, POS, and sales records in one quiet workspace.
        </p>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-white/10 bg-[#0d1017]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur md:static md:flex md:flex-1 md:flex-col md:gap-2 md:border-t-0 md:p-4 md:shadow-none">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition md:justify-start ${
                isActive
                  ? "bg-amber-300 text-slate-950 shadow-lg shadow-amber-950/20"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <form action={signOut} className="hidden border-t border-white/10 p-4 md:block">
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white">
          <LogOut size={18} />
          Keluar
        </button>
      </form>
    </aside>
  );
}
