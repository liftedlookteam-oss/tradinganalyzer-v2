"use client";

type AccountHeaderProps = {
  email: string;
};

export default function AccountHeader({
  email,
}: AccountHeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Account Center
        </p>

        <h1 className="text-5xl font-bold tracking-tight">
          Manage Account
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="/"
          className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
        >
          Back to Analyzer
        </a>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-700 text-sm font-bold text-white">
          {email.slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
}