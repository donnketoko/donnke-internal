import { redirect } from "next/navigation";

import { Sidebar } from "@/components/dashboard/sidebar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 bg-[linear-gradient(180deg,rgba(251,191,36,0.08),rgba(9,11,16,0)_300px)] px-4 pb-24 pt-5 sm:px-6 md:px-8 md:pb-10 md:pt-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 shadow-lg shadow-black/20 backdrop-blur md:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">Donnke</p>
              <p className="text-sm font-medium text-slate-300">Internal dashboard</p>
            </div>
            <div className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
              Live
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
