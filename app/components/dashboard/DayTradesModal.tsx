"use client";

import type { Trade } from "./types";

type DayTradesModalProps = {
  error: string;
  deleting: boolean;
  onEdit: (trade: Trade) => void;
  onDelete: (trade: Trade) => void;
  open: boolean;
  selectedDay: Date | null;
  selectedDayTrades: Trade[];
  currency: string;
  formatMoney: (value: number, currency: string) => string;
  onClose: () => void;
};

export default function DayTradesModal({
  error,
  deleting,
  onEdit,
  onDelete,
  open,
  selectedDay,
  selectedDayTrades,
  currency,
  formatMoney,
  onClose,
}: DayTradesModalProps) {
  if (!open || !selectedDay) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm max-md:px-3 max-md:py-3">
      <div className="w-full max-w-2xl rounded-[2rem] border border-zinc-700 bg-zinc-950 p-6 text-white shadow-2xl max-md:max-h-[calc(100dvh-1.5rem)] max-md:overflow-y-auto max-md:overscroll-contain max-md:p-4 max-md:[overflow-wrap:anywhere]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">
              {selectedDay.toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h2>

            <p className="mt-2 text-zinc-400">
              Trades logged on this day
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition hover:border-zinc-400 hover:bg-zinc-800"
          >
            Close
          </button>
        </div>

        {error && <p role="alert" className="mt-3 text-red-300">{error}</p>}
        <div className="mt-6 max-h-[60vh] space-y-3 overflow-y-auto">
          {selectedDayTrades.map((trade) => (
            <div
              key={trade.id}
              className="rounded-2xl border border-zinc-700 bg-zinc-900/60 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-white">
                    {trade.asset}
                  </p>

                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    {trade.result}
                  </p>
                </div>

                <p
                  className={`text-lg font-bold ${
                    Number(trade.amount) > 0
                      ? "text-emerald-400"
                      : Number(trade.amount) < 0
                      ? "text-red-400"
                      : "text-zinc-300"
                  }`}
                >
                  {formatMoney(Number(trade.amount), currency)}
                </p>
              </div>

              <div className="mt-3 flex gap-4 text-sm">
                <button disabled={deleting} onClick={() => onEdit(trade)} className="underline">Edit</button>
                <button disabled={deleting} onClick={() => onDelete(trade)} className="text-red-300 underline">Delete</button>
              </div>
              {trade.notes && (
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {trade.notes}
                </p>
              )}
            </div>
          ))}

          {selectedDayTrades.length === 0 && (
            <div className="rounded-2xl border border-zinc-700 bg-zinc-900/60 p-5 text-zinc-400">
              No trades logged for this day.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}