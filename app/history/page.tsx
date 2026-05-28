"use client";

import { useEffect, useMemo, useState } from "react";

type HistoryItem = {
  id: string;
  market: string;
  instrument?: string | null;
  trade_duration: string;
  analysis: {
    overallBias: string;
    tradeQuality: string;
    marketState?: string;
    mostImportantThing: string;
    bullishScore: number;
    bearishScore: number;
    finalDecision: string;
  };
  created_at: string;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] =
    useState<HistoryItem | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  async function loadHistory() {
    try {
      const response = await fetch(
        "/api/history"
      );

      const data =
        await response.json();

      setItems(
        data.items ||
          data.analyses ||
          []
      );
    } catch {
      console.error(
        "Failed to load history"
      );
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const response = await fetch(
        "/api/history",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: deleteTarget.id,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        alert(
          data.error ||
            "Failed to delete analysis."
        );

        return;
      }

      setItems((prev) =>
        prev.filter(
          (item) =>
            item.id !==
            deleteTarget.id
        )
      );

      setDeleteTarget(null);
    } catch {
      alert(
        "Failed to delete analysis."
      );
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return items.filter((item) => {
      const searchable = [
        item.market,
        item.instrument,
        item.trade_duration,
        item.analysis
          ?.overallBias,
        item.analysis
          ?.tradeQuality,
        item.analysis
          ?.marketState,
        item.analysis
          ?.mostImportantThing,
        item.analysis
          ?.finalDecision,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchable.includes(query);

      const matchesFilter =
        filter === "All" ||
        item.analysis
          ?.overallBias ===
          filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [items, search, filter]);

  const totalAnalyses =
    items.length;

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Saved Analyses
            </p>

            <h1 className="text-5xl font-bold tracking-tight">
              Analysis History
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
              Review previous chart
              analyses, compare market
              states and revisit
              important trading
              scenarios.
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

        <section className="mb-6 grid gap-5 md:grid-cols-3">
          <SummaryCard
            label="Total Analyses"
            value={String(
              totalAnalyses
            )}
          />

          <SummaryCard
            label="Visible Results"
            value={String(
              filteredItems.length
            )}
          />

          <SummaryCard
            label="Storage"
            value="Private account history"
          />
        </section>

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search instrument, market, bias, state or decision..."
              className="w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-white"
            />

            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value
                )
              }
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
        ) : filteredItems.length ===
          0 ? (
          <EmptyState
            title="No analyses found"
            text="Run a new analysis or adjust your search filters."
          />
        ) : (
          <section className="grid gap-5">
            {filteredItems.map(
              (item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onDelete={() =>
                    setDeleteTarget(
                      item
                    )
                  }
                />
              )
            )}
          </section>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-red-300">
              Delete Analysis
            </p>

            <h2 className="text-2xl font-bold">
              Remove this saved
              analysis?
            </h2>

            <p className="mt-3 leading-7 text-zinc-400">
              This action permanently
              removes the analysis
              from your history.
            </p>

            <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Tag>
                  {deleteTarget.market}
                </Tag>

                {deleteTarget.instrument && (
                  <Tag highlight>
                    {
                      deleteTarget.instrument
                    }
                  </Tag>
                )}
              </div>

              <p className="mt-3 text-sm text-zinc-500">
                {
                  deleteTarget.trade_duration
                }
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
                disabled={deleting}
                className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:border-white hover:text-white disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                onClick={
                  confirmDelete
                }
                disabled={deleting}
                className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-300 transition hover:border-red-400 hover:bg-red-500/20 disabled:opacity-40"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function HistoryCard({
  item,
  onDelete,
}: {
  item: HistoryItem;
  onDelete: () => void;
}) {
  const date = new Date(
    item.created_at
  );

  const bias =
    item.analysis
      ?.overallBias || "Unknown";

  const quality =
    item.analysis
      ?.tradeQuality ||
    "Unknown";

  const state =
    item.analysis
      ?.marketState ||
    "Unknown";

  return (
    <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-zinc-600">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Tag>
              {item.market}
            </Tag>

            {item.instrument && (
              <Tag highlight>
                {item.instrument}
              </Tag>
            )}

            <Tag muted>
              {formatDate(date)}
            </Tag>
          </div>

          <h2 className="mt-5 text-3xl font-bold">
            {item.instrument ||
              item.market}{" "}
            Analysis
          </h2>

          <p className="mt-2 text-zinc-500">
            {
              item.trade_duration
            }
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href={`/history/${item.id}`}
            className="w-fit rounded-2xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
          >
            Open Analysis
          </a>

          <button
            onClick={onDelete}
            className="w-fit rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:border-red-400 hover:bg-red-500/20"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric
          label="Bias"
          value={bias}
        />

        <Metric
          label="Quality"
          value={quality}
        />

        <Metric
          label="Market State"
          value={state}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ScoreCard
          type="bullish"
          score={
            item.analysis
              ?.bullishScore ||
            0
          }
        />

        <ScoreCard
          type="bearish"
          score={
            item.analysis
              ?.bearishScore ||
            0
          }
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <TextPanel
          title="Most Important Thing"
          value={
            item.analysis
              ?.mostImportantThing ||
            "No important insight available."
          }
        />

        <TextPanel
          title="Final Decision"
          value={
            item.analysis
              ?.finalDecision ||
            "No final decision available."
          }
        />
      </div>
    </article>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-600">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function ScoreCard({
  type,
  score,
}: {
  type: "bullish" | "bearish";
  score: number;
}) {
  const safeScore = Math.max(
    0,
    Math.min(
      100,
      Number(score) || 0
    )
  );

  const isBullish =
    type === "bullish";

  return (
    <div
      className={`rounded-3xl border p-5 ${
        isBullish
          ? "border-green-600/60 bg-green-900/20"
          : "border-red-600/60 bg-red-900/20"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-lg font-bold">
          {isBullish
            ? "Bullish"
            : "Bearish"}{" "}
          Score
        </p>

        <p className="text-2xl font-bold">
          {safeScore}/100
        </p>
      </div>

      <div className="relative h-4 rounded-full bg-zinc-800">
        <div
          className="absolute left-0 top-0 h-4 rounded-full bg-white"
          style={{
            width: `${safeScore}%`,
          }}
        />
      </div>
    </div>
  );
}

function TextPanel({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-5">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
        {title}
      </p>

      <p className="leading-8 text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function Tag({
  children,
  highlight = false,
  muted = false,
}: {
  children: React.ReactNode;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        highlight
          ? "bg-white text-black"
          : muted
          ? "bg-zinc-900 text-zinc-500"
          : "bg-black text-zinc-300"
      }`}
    >
      {children}
    </span>
  );
}

function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
      <h2 className="text-3xl font-bold">
        {title}
      </h2>

      <p className="mt-3 text-zinc-400">
        {text}
      </p>
    </div>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}