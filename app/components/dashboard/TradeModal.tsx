"use client";

type TradeModalProps = {
  open: boolean;
  isSaving: boolean;
  asset: string;
  result: "win" | "loss" | "breakeven";
  amount: string;
  notes: string;
  onClose: () => void;
  onSave: () => void;
  onAssetChange: (value: string) => void;
  onResultChange: (value: "win" | "loss" | "breakeven") => void;
  onAmountChange: (value: string) => void;
  onNotesChange: (value: string) => void;
};

export default function TradeModal({
  open,
  isSaving,
  asset,
  result,
  amount,
  notes,
  onClose,
  onSave,
  onAssetChange,
  onResultChange,
  onAmountChange,
  onNotesChange,
}: TradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl">
        <h2 className="text-3xl font-bold">
          Log Trade
        </h2>

        <input
          value={asset}
          onChange={(e) => onAssetChange(e.target.value)}
          placeholder="Asset e.g. BTCUSD, AAPL"
          className="mt-5 w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
        />

        <select
          value={result}
          onChange={(e) =>
            onResultChange(
              e.target.value as "win" | "loss" | "breakeven"
            )
          }
          className="mt-3 w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none focus:border-zinc-600"
        >
          <option value="win">Win</option>
          <option value="loss">Loss</option>
          <option value="breakeven">Breakeven</option>
        </select>

        <input
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          type="number"
          placeholder="Amount"
          className="mt-3 w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
        />

        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Notes optional"
          className="mt-3 min-h-[100px] w-full resize-y rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
        />

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-full rounded-2xl border border-zinc-700 px-5 py-4 font-bold text-white transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="w-full rounded-2xl bg-white px-5 py-4 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Trade"}
          </button>
        </div>
      </div>
    </div>
  );
}