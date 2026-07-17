"use client";

type SummaryCardProps = {
  title: string;
  amount: string;
  trades: string;
  value: number;
  hasTrades: boolean;
};

export default function SummaryCard({
  title,
  amount,
  trades,
  value,
  hasTrades,
}: SummaryCardProps) {
  const className = !hasTrades
    ? "border-zinc-800 bg-zinc-950"
    : value > 0
    ? "border-emerald-500/35 bg-emerald-900/35"
    : value < 0
    ? "border-red-500/35 bg-red-900/35"
    : "border-zinc-700 bg-zinc-900";

  return (
    <div className={`rounded-[2rem] border p-5 ${className}`}>
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
        {title}
      </p>

      <p className="mt-5 text-3xl font-bold">
        {amount}
      </p>

      <p className="mt-2 text-sm text-zinc-400">
        {trades}
      </p>
    </div>
  );
}