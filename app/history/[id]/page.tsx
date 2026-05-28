"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type AnalysisRecord = {
  id: string;
  market: string;
  instrument?: string | null;
  trade_duration: string;
  created_at: string;
  analysis: {
    overallBias: string;
    tradeQuality: string;
    marketState: string;
    noTradeReason?: string;
    mostImportantThing: string;
    keyLevels: string;
    marketStructure: string;
    bullishScenario: string;
    bullishConditions: string;
    bearishScenario: string;
    bearishConditions: string;
    bullishScore: number;
    bearishScore: number;
    finalDecision: string;
  };
};

export default function HistoryDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [item, setItem] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalysis() {
      try {
        const response = await fetch(`/api/history/${id}`);
        const data = await response.json();

        if (response.ok) {
          setItem(data.analysis);
        }
      } catch {
        console.error("Failed to load analysis.");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadAnalysis();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-400">
          Loading analysis...
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <h1 className="text-3xl font-bold">Analysis not found</h1>

          <a
            href="/history"
            className="mt-6 inline-block rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black"
          >
            Back to History
          </a>
        </div>
      </main>
    );
  }

  const analysis = item.analysis;

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Saved Analysis
            </p>

            <h1 className="text-4xl font-bold">
              Trade Decision Dashboard
            </h1>

            <div className="mt-3 flex flex-wrap gap-2">
              <Tag>{item.market}</Tag>

              {item.instrument && <Tag highlight>{item.instrument}</Tag>}

              <Tag muted>{item.trade_duration}</Tag>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/history"
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
            >
              Back to History
            </a>

            <a
              href="/"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              New Analysis
            </a>
          </div>
        </div>

        <section className="mb-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <TopMetric title="Overall Bias" value={analysis.overallBias} />
          <TopMetric title="Trade Quality" value={analysis.tradeQuality} />
          <TopMetric title="Market State" value={analysis.marketState} />
          <TopMetric title="Trade Duration" value={item.trade_duration} />
        </section>

        <section className="mb-6 grid gap-6 lg:grid-cols-2">
          <SimpleCard title="Key Levels" value={analysis.keyLevels} />
          <SimpleCard
            title="Market Structure"
            value={analysis.marketStructure}
          />
        </section>

        <section className="mb-6 grid gap-6 lg:grid-cols-2">
          <ScenarioPanel
            type="bullish"
            title="Bullish Scenario"
            scenario={analysis.bullishScenario}
            conditions={analysis.bullishConditions}
            score={analysis.bullishScore}
          />

          <ScenarioPanel
            type="bearish"
            title="Bearish Scenario"
            scenario={analysis.bearishScenario}
            conditions={analysis.bearishConditions}
            score={analysis.bearishScore}
          />
        </section>

        <section className="mb-6 rounded-3xl border border-yellow-500/40 bg-yellow-500/10 p-7">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-yellow-300">
            Most Important Thing Right Now
          </p>

          <p className="text-2xl font-bold leading-tight text-white">
            {analysis.mostImportantThing}
          </p>
        </section>

        {analysis.tradeQuality === "No Trade" && analysis.noTradeReason && (
          <section className="mb-6 rounded-3xl border border-red-500/40 bg-red-500/10 p-7">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-red-300">
              No Trade Reason
            </p>

            <p className="text-2xl font-bold leading-tight text-white">
              {analysis.noTradeReason}
            </p>
          </section>
        )}

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
            Final Decision
          </p>

          <p className="text-2xl font-bold leading-tight text-white">
            {analysis.finalDecision}
          </p>
        </section>
      </div>
    </main>
  );
}

function TopMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold">{value || "N/A"}</p>
    </div>
  );
}

function SimpleCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="text-2xl font-bold">{title}</h2>

      <p className="mt-4 whitespace-pre-wrap leading-8 text-zinc-300">
        {value || "N/A"}
      </p>
    </div>
  );
}

function ScenarioPanel({
  type,
  title,
  scenario,
  conditions,
  score,
}: {
  type: "bullish" | "bearish";
  title: string;
  scenario: string;
  conditions: string;
  score: number;
}) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const isBullish = type === "bullish";

  return (
    <div
      className={`rounded-3xl border p-6 ${
        isBullish
          ? "border-green-600/70 bg-green-900/35"
          : "border-red-600/70 bg-red-900/35"
      }`}
    >
      <h2 className="text-3xl font-bold">{title}</h2>

      <div className="mt-6 rounded-2xl bg-black/50 p-5">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
          Scenario
        </p>

        <p className="whitespace-pre-wrap leading-8 text-zinc-200">
          {scenario || "No scenario provided."}
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-black/50 p-5">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
          What must happen
        </p>

        <p className="whitespace-pre-wrap leading-8 text-zinc-200">
          {conditions || "No conditions provided."}
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-black/60 p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-bold">Probability Score</p>
          <p className="text-2xl font-bold">{safeScore}/100</p>
        </div>

        <div className="relative h-4 rounded-full bg-zinc-800">
          <div
            className="absolute left-0 top-0 h-4 rounded-full bg-white"
            style={{ width: `${safeScore}%` }}
          />
        </div>
      </div>
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