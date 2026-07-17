"use client";

type EmptyStateProps = {
  title: string;
  text: string;
};

export default function EmptyState({
  title,
  text,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
      <h2 className="text-3xl font-bold">
        {title}
      </h2>

      <p className="mt-3 text-zinc-400">
        {text}
      </p>
    </div>
  );
}