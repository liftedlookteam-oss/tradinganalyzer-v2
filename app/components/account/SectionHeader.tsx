"use client";

type SectionHeaderProps = {
  title: string;
  description: string;
};

export default function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mb-7 border-b border-zinc-800 pb-6">
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
        {title}
      </p>

      <h2 className="text-2xl font-bold md:text-3xl">
        {title}
      </h2>

      <p className="mt-3 max-w-2xl leading-7 text-zinc-400">
        {description}
      </p>
    </div>
  );
}