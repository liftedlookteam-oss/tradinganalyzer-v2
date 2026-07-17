"use client";

type BalanceModalProps = {
  open: boolean;
  isSaving: boolean;
  balanceDraft: number;
  currencyDraft: string;
  currencies: string[];
  onClose: () => void;
  onSave: () => void;
  onBalanceDraftChange: (value: number) => void;
  onCurrencyDraftChange: (value: string) => void;
};

export default function BalanceModal({
  open,
  isSaving,
  balanceDraft,
  currencyDraft,
  currencies,
  onClose,
  onSave,
  onBalanceDraftChange,
  onCurrencyDraftChange,
}: BalanceModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-3xl font-bold">Set Account Balance</h2>

        <p className="mt-3 text-zinc-400">
          Set your real account starting balance and choose the account
          currency.
        </p>

        <input
          value={balanceDraft === 0 ? "" : balanceDraft}
          onChange={(e) =>
            onBalanceDraftChange(Number(e.target.value || 0))
          }
          type="number"
          placeholder="Starting balance"
          className="mt-5 w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none"
        />

        <select
          value={currencyDraft}
          onChange={(e) => onCurrencyDraftChange(e.target.value)}
          className="mt-3 w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 outline-none"
        >
          {currencies.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-full rounded-2xl border border-zinc-700 px-5 py-4 font-bold transition hover:border-zinc-500 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="w-full rounded-2xl bg-white px-5 py-4 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Balance"}
          </button>
        </div>
      </div>
    </div>
  );
}