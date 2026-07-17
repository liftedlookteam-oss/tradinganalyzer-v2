"use client";

import type { HistoryItem } from "./types";
import Tag from "./Tag";

type DeleteModalProps = {
  item: HistoryItem;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteModal({
  item,
  deleting,
  onCancel,
  onConfirm,
}: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-red-300">
          Delete Analysis
        </p>

        <h2 className="text-2xl font-bold">
          Remove this saved analysis?
        </h2>

        <p className="mt-3 leading-7 text-zinc-400">
          This action permanently removes the analysis from your history.
        </p>

        <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Tag>{item.market}</Tag>

            {item.instrument && (
              <Tag highlight>{item.instrument}</Tag>
            )}
          </div>

          <p className="mt-3 text-sm text-zinc-500">
            {item.trade_duration}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:border-white hover:text-white disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-300 transition hover:border-red-400 hover:bg-red-500/20 disabled:opacity-40"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}