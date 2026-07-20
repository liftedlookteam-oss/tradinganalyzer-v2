"use client";

type InfoCardProps = {
  label: string;
  value: string;
};

export default function InfoCard({
  label,
  value,
}: InfoCardProps) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black/40 p-4 md:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600">
        {label}
      </p>

      <p className="mt-3 break-words text-lg font-bold text-white">
        {value}
      </p>
    </div>
  );
}