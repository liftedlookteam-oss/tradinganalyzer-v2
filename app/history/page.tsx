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

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  async function loadHistory() {
    try {
      const response = await fetch("/api/history");
      const data = await response.json();

      setItems(data.items || []);
    } catch {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id: string) {
    const confirmed = confirm(
      "Delete this analysis permanently?"
    );

    if (!confirmed) return;

    try {
      await fetch("/api/history", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      setItems((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch {
      alert("Failed to delete analysis.");
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.market
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.instrument
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.analysis?.overallBias
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.analysis?.marketState
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        item.analysis?.overallBias === filter;

      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Saved Analyses
            </p>

            <h1 className="text-5xl font-bold tracking-tight">
              Analysis History
            </h1>
          </div>

          <a
            href="/"
            className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
          >
            Back to Analyzer
          </a>
        </div>

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search market, instrument, bias or market state..."
              className="w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-white"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-400">
            Loading history...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-400">
            No analyses found.
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredItems.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </div>
        )}
      </div>
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
  const date = new Date(item.created_at);

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-zinc-300">
              {item.market}
            </span>

            {item.instrument && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                {item.instrument}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <MetricBadge
              label="Bias"
              value={item.analysis?.overallBias || "Unknown"}
            />

            <MetricBadge
              label="Quality"
              value={item.analysis?.tradeQuality || "Unknown"}
            />

            <MetricBadge
              label="State"
              value={item.analysis?.marketState || "Unknown"}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-zinc-500">
              {date.toLocaleDateString()}
            </p>

            <p className="mt-1 text-sm text-zinc-600">
              {item.trade_duration}
            </p>
          </div>

          <button
            onClick={onDelete}
            className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:border-red-400 hover:bg-red-500/20"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ScoreCard
          type="bullish"
          score={item.analysis?.bullishScore || 0}
        />

        <ScoreCard
          type="bearish"
          score={item.analysis?.bearishScore || 0}
        />
      </div>

      <div className="mt-5 rounded-2xl bg-black p-5">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
          Most Important Thing
        </p>

        <p className="leading-8 text-zinc-300">
          {item.analysis?.mostImportantThing ||
            "No important insight available."}
        </p>
      </div>

      <div className="mt-5 rounded-2xl bg-black p-5">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
          Final Decision
        </p>

        <p className="leading-8 text-white">
          {item.analysis?.finalDecision ||
            "No final decision available."}
        </p>
      </div>
    </div>
  );
}

function MetricBadge({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-full border border-zinc-700 bg-black px-4 py-2">
      <span className="mr-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-white">
        {value}
      </span>
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
    Math.min(100, Number(score) || 0)
  );

  const isBullish = type === "bullish";

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isBullish
          ? "border-green-600/60 bg-green-900/20"
          : "border-red-600/60 bg-red-900/20"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-lg font-bold">
          {isBullish ? "Bullish" : "Bearish"} Score
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