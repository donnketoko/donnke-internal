import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#78350f,transparent_32%),#020617] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Donnke</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Masuk dashboard</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Gunakan akun Supabase Auth yang sudah dibuat untuk tim internal.
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
