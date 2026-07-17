"use client";

import type { HistoryItem } from "./types";
import Metric from "./Metric";
import ScoreCard from "./ScoreCard";
import Tag from "./Tag";
import TextPanel from "./TextPanel";

type HistoryCardProps = {
  item: HistoryItem;
  onDelete: () => void;
};

export default function HistoryCard({
  item,
  onDelete,
}: HistoryCardProps) {
  const date = new Date(item.created_at);

  const bias = item.analysis?.overallBias || "Unknown";
  const quality = item.analysis?.tradeQuality || "Unknown";
  const state = item.analysis?.marketState || "Unknown";

  return (
    <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-zinc-600">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Tag>{item.market}</Tag>

            {item.instrument && (
              <Tag highlight>{item.instrument}</Tag>
            )}

            <Tag muted>{formatDate(date)}</Tag>
          </div>

          <h2 className="mt-5 text-3xl font-bold">
            {item.instrument || item.market} Analysis
          </h2>

          <p className="mt-2 text-zinc-500">
            {item.trade_duration}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={`/history/${item.id}`}
            className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
          >
            Open Analysis
          </a>

          <button
            onClick={onDelete}
            className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:border-red-400 hover:bg-red-500/20"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="Bias" value={bias} />
        <Metric label="Quality" value={quality} />
        <Metric label="Market State" value={state} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ScoreCard
          type="bullish"
          score={item.analysis?.bullishScore || 0}
        />

        <ScoreCard
          type="bearish"
          score={item.analysis?.bearishScore || 0}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <TextPanel
          title="Most Important Thing"
          value={
            item.analysis?.mostImportantThing ||
            "No important insight available."
          }
        />

        <TextPanel
          title="Final Decision"
          value={
            item.analysis?.finalDecision ||
            "No final decision available."
          }
        />
      </div>
    </article>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}