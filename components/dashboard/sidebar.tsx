"use client";

import { BarChart3, CircleDot, Database, LayoutDashboard, LogOut, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/actions/auth";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Produk", icon: Package },
  { href: "/dashboard/pos", label: "POS", icon: ShoppingCart },
  { href: "/dashboard/sales", label: "Riwayat", icon: BarChart3 },
  { href: "/test-supabase", label: "Test", icon: Database },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex border-white/10 bg-[#0d0b09]/95 md:sticky md:top-0 md:min-h-screen md:w-72 md:flex-col md:border-r md:shadow-2xl md:shadow-black/20">
      <div className="hidden border-b border-white/10 p-6 md:block">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-200 to-orange-400 text-[#1c1206] shadow-lg shadow-orange-950/30">
            <CircleDot size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">Donnke</p>
            <h1 className="mt-1 text-lg font-semibold text-white">Internal</h1>
          </div>
        </div>
        <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs leading-5 text-slate-400">
          Bakery operations, POS, and sales records in one focused workspace.
        </p>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-white/10 bg-[#0d0b09]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur md:static md:flex md:flex-1 md:flex-col md:gap-2 md:border-t-0 md:p-4 md:shadow-none">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition md:justify-start ${
                isActive
                  ? "bg-gradient-to-r from-amber-200 to-orange-300 text-[#1c1206] shadow-lg shadow-orange-950/20"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
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
        <button className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-white">
          <LogOut size={18} />
          Keluar
        </button>
      </form>
    </aside>
  );
}
