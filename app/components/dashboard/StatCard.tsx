"use client";

type StatCardProps = {
  label: string;
  value: string;
  subtext: string;
};

export default function StatCard({
  label,
  value,
  subtext,
}: StatCardProps) {
  return (
    <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
        {label}
      </p>

      <p className="mt-4 text-4xl font-bold">
        {value}
      </p>

      <p className="mt-3 text-sm text-zinc-400">
        {subtext}
      </p>
    </div>
  );
}