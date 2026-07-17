"use client";

import DeleteModal from "./DeleteModal";
import EmptyState from "./EmptyState";
import HistoryCard from "./HistoryCard";
import SummaryCard from "./SummaryCard";
import type { HistoryItem } from "./types";

type DesktopHistoryProps = {
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

export default function DesktopHistory({
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
}: DesktopHistoryProps) {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between gap-5">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Saved Analyses
            </p>

            <h1 className="text-5xl font-bold tracking-tight">
              Analysis History
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Review previous chart analyses, compare market states and revisit
              important trading scenarios.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/account"
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
            >
              Account
            </a>

            <a
              href="/"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              New Analysis
            </a>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-3 gap-5">
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
            value="Private account history"
          />
        </section>

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="grid grid-cols-[1fr_220px] gap-4">
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search instrument, market, bias, state or decision..."
              className="w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-white"
            />

            <select
              value={filter}
              onChange={(event) => onFilterChange(event.target.value)}
              className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none focus:border-white"
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
            text="Run a new analysis or adjust your search filters."
          />
        ) : (
          <section className="grid gap-5">
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