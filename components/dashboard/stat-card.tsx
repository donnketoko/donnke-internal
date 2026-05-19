import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#11100d]/90 p-5 shadow-xl shadow-black/15">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="grid size-10 place-items-center rounded-xl border border-amber-300/15 bg-amber-300/10 text-amber-100">
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-5 text-2xl font-semibold text-white sm:text-3xl">{value}</p>
    </article>
  );
}
