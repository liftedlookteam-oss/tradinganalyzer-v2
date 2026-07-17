"use client";

import DeleteModal from "./DeleteModal";
import EmptyState from "./EmptyState";
import HistoryCard from "./HistoryCard";
import SummaryCard from "./SummaryCard";
import type { HistoryItem } from "./types";

type MobileHistoryProps = {
  filteredItems: HistoryItem[];
  totalAnalyses: number;
  loading: boolean;
  search: string;
  filter: string;
  deleteTarget: HistoryItem | null;
  deleting: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onDeleteRequest: (item: HistoryItem) => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
};

export default function MobileHistory({
  filteredItems,
  totalAnalyses,
  loading,
  search,
  filter,
  deleteTarget,
  deleting,
  onSearchChange,
  onFilterChange,
  onDeleteRequest,
  onDeleteCancel,
  onDeleteConfirm,
}: MobileHistoryProps) {
  return (
    <main className="min-h-screen bg-[#050505] text-white pb-10">
      <div className="px-5 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Saved Analyses
        </p>

        <h1 className="mt-2 text-4xl font-bold leading-tight">
          Analysis History
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Review previous analyses and quickly revisit your trading decisions.
        </p>
      </div>

      <div className="mt-6 flex gap-3 px-5">
        <a
          href="/"
          className="flex-1 rounded-2xl bg-white py-3 text-center font-semibold text-black"
        >
          New Analysis
        </a>

        <a
          href="/account"
          className="flex-1 rounded-2xl border border-zinc-700 bg-zinc-900 py-3 text-center font-semibold"
        >
          Account
        </a>
      </div>

      <div className="mt-6 grid gap-3 px-5">
        <SummaryCard
          label="Total"
          value={String(totalAnalyses)}
        />

        <SummaryCard
          label="Visible"
          value={String(filteredItems.length)}
        />
      </div>

      <div className="mt-6 px-5">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search analyses..."
            className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none placeholder:text-zinc-600 focus:border-white"
          />

          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="mt-3 w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-white"
          >
            <option>All</option>
            <option>Bullish</option>
            <option>Bearish</option>
            <option>Neutral</option>
            <option>Unclear</option>
          </select>
        </div>
      </div>

      <div className="mt-6 px-5">
        {loading ? (
          <EmptyState
            title="Loading..."
            text="Fetching analyses."
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No analyses"
            text="Run a new analysis to get started."
          />
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onDelete={() => onDeleteRequest(item)}
              />
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          deleting={deleting}
          onCancel={onDeleteCancel}
          onConfirm={onDeleteConfirm}
        />
      )}
    </main>
  );
}