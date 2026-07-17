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
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white">
      <div className="mx-auto max-w-md">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Saved Analyses
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Analysis History
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Review previous analyses and revisit important trading decisions.
          </p>

          <div className="mt-5 flex gap-3">
            <a
              href="/account"
              className="flex-1 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-center text-sm font-bold text-zinc-200"
            >
              Account
            </a>

            <a
              href="/"
              className="flex-1 rounded-2xl bg-white px-4 py-3 text-center text-sm font-bold text-black"
            >
              New Analysis
            </a>
          </div>
        </header>

        <section className="mb-6 grid gap-3">
          <SummaryCard
            label="Total Analyses"
            value={String(totalAnalyses)}
          />

          <SummaryCard
            label="Visible Results"
            value={String(filteredItems.length)}
          />

          <SummaryCard
            label="Storage"
            value="Private history"
          />
        </section>

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="space-y-3">
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-white"
            />

            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-white"
            >
              <option>All</option>
              <option>Bullish</option>
              <option>Bearish</option>
              <option>Neutral</option>
              <option>Unclear</option>
            </select>
          </div>
        </section>

        {loading ? (
          <EmptyState
            title="Loading history..."
            text="Fetching your saved analyses."
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No analyses found"
            text="Run a new analysis or adjust your search."
          />
        ) : (
          <section className="space-y-4">
            {filteredItems.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onDelete={() => onDeleteRequest(item)}
              />
            ))}
          </section>
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