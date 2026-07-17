"use client";

type TextPanelProps = {
  title: string;
  value: string;
};

export default function TextPanel({
  title,
  value,
}: TextPanelProps) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-5">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
        {title}
      </p>

      <p className="leading-8 text-zinc-300">
        {value}
      </p>
    </div>
  );
}