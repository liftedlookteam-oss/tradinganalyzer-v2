"use client";

type UpgradeModalProps = {
  onClose: () => void;
  onWeekly: () => void;
  onMonthly: () => void;
};

export default function UpgradeModal({
  onClose,
  onWeekly,
  onMonthly,
}: UpgradeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-zinc-800 bg-[#070707] shadow-2xl">
        <div className="border-b border-zinc-800 bg-gradient-to-br from-zinc-950 to-black p-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-zinc-500">
            ChartSetup Pro
          </p>

          <h2 className="text-4xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Analyze without limits.
            </span>
          </h2>

          <p className="mt-4 max-w-xl leading-8 text-zinc-400">
            Upgrade to unlock unlimited AI chart analyses, complete history
            access, and priority processing.
          </p>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <button
            onClick={onWeekly}
            className="rounded-3xl border border-white bg-white p-6 text-left text-black transition hover:bg-zinc-200"
          >
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-600">
              Weekly
            </p>

            <div className="mt-4 flex items-end gap-2">
              <p className="text-4xl font-bold">€4.99</p>
              <p className="mb-1 text-zinc-600">/ week</p>
            </div>

            <p className="mt-4 leading-7 text-zinc-700">
              Flexible access for traders who want unlimited analysis without a
              monthly commitment.
            </p>

            <div className="mt-6 rounded-2xl bg-black px-4 py-3 text-center font-bold text-white">
              Choose Weekly
            </div>
          </button>

          <button
            onClick={onMonthly}
            className="relative rounded-3xl border border-white bg-white p-6 text-left text-black transition hover:bg-zinc-200"
          >
            <div className="absolute right-5 top-5 rounded-full bg-black px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
              Best Value
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-600">
              Monthly
            </p>

            <div className="mt-4 flex items-end gap-2">
              <p className="text-4xl font-bold">€14.99</p>
              <p className="mb-1 text-zinc-600">/ month</p>
            </div>

            <p className="mt-4 leading-7 text-zinc-700">
              Best for active traders who analyze setups regularly.
            </p>

            <div className="mt-6 rounded-2xl bg-black px-4 py-3 text-center font-bold text-white">
              Choose Monthly
            </div>
          </button>
        </div>

        <div className="border-t border-zinc-800 px-6 py-5">
          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-zinc-800 px-5 py-3 text-sm font-bold text-zinc-400 transition hover:border-zinc-600 hover:text-white"
          >
            Continue with free daily analysis
          </button>
        </div>
      </div>
    </div>
  );
}