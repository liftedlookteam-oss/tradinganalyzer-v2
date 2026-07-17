"use client";

type SummaryCardProps = {
  label: string;
  value: string;
};

export default function SummaryCard({
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}