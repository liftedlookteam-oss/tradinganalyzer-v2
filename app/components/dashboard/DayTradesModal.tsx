"use client";

import type { Trade } from "./types";

type DayTradesModalProps = {
  open: boolean;
  selectedDay: Date | null;
  selectedDayTrades: Trade[];
  currency: string;
  formatMoney: (value: number, currency: string) => string;
  onClose: () => void;
};

export default function DayTradesModal({
  open,
  selectedDay,
  selectedDayTrades,
  currency,
  formatMoney,
  onClose,
}: DayTradesModalProps) {
  if (!open || !selectedDay) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">
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
            onClick={onClose}
            className="rounded-2xl border border-zinc-700 px-4 py-2 text-sm font-bold"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {selectedDayTrades.map((trade) => (
            <div
              key={trade.id}
              className="rounded-2xl border border-zinc-800 bg-black p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-bold">{trade.asset}</p>

                  <p className="mt-1 text-sm uppercase tracking-[0.2em] text-zinc-500">
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

              {trade.notes && (
                <p className="mt-3 text-sm text-zinc-400">
                  {trade.notes}
                </p>
              )}
            </div>
          ))}

          {selectedDayTrades.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-black p-5 text-zinc-400">
              No trades logged for this day.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}