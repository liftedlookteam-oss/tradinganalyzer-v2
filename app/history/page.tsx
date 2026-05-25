"use client";

import { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";

type SavedAnalysis = {
  id: string;
  created_at: string;
  market: string;
  trade_duration: string;
  analysis: {
    overallBias?: string;
    tradeQuality?: string;
    mostImportantThing?: string;
    keyLevels?: string;
    marketStructure?: string;
    bullishScenario?: string;
    bullishConditions?: string;
    bearishScenario?: string;
    bearishConditions?: string;
    bullishScore?: number;
    bearishScore?: number;
    finalDecision?: string;
  };
};

export default function HistoryPage() {
  const { isSignedIn, isLoaded } = useUser();

  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }

    async function loadHistory() {
      try {
        const response = await fetch("/api/history");
        const data = await response.json();

        if (data.success) {
          setAnalyses(data.analyses || []);
        }
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [isLoaded, isSignedIn]);

  const selectedAnalysis = analyses.find((item) => item.id === selectedId);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Saved Setups
            </p>

            <h1 className="text-4xl font-bold">Analysis History</h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
            >
              New Analysis
            </a>

            <UserButton />
          </div>
        </header>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <p className="text-zinc-400">Loading history...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h2 className="text-2xl font-bold">No saved analyses yet</h2>

            <p className="mt-3 text-zinc-400">
              Run your first chart analysis and it will appear here.
            </p>

            <a
              href="/"
              className="mt-6 inline-block rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              Start Analysis
            </a>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <section className="space-y-4">
              {analyses.map((item) => {
                const isSelected = selectedId === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full rounded-3xl border p-5 text-left transition ${
                      isSelected
                        ? "border-white bg-zinc-900"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold">{item.market}</p>

                        <p className="mt-1 text-sm text-zinc-500">
                          {item.trade_duration}
                        </p>
                      </div>

                      <p className="text-xs text-zinc-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-black px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Bias
                        </p>

                        <p className="mt-1 font-bold">
                          {item.analysis.overallBias || "N/A"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-black px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Quality
                        </p>

                        <p className="mt-1 font-bold">
                          {item.analysis.tradeQuality || "N/A"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
              {!selectedAnalysis ? (
                <div>
                  <h2 className="text-2xl font-bold">Select an analysis</h2>

                  <p className="mt-3 text-zinc-400">
                    Choose a saved setup from the left to view the full analysis.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
                        Saved Analysis
                      </p>

                      <h2 className="mt-2 text-3xl font-bold">
                        {selectedAnalysis.market}
                      </h2>

                      <p className="mt-2 text-zinc-400">
                        {selectedAnalysis.trade_duration}
                      </p>
                    </div>

                    <p className="text-sm text-zinc-500">
                      {new Date(selectedAnalysis.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <Metric
                      title="Bias"
                      value={selectedAnalysis.analysis.overallBias || "N/A"}
                    />

                    <Metric
                      title="Quality"
                      value={selectedAnalysis.analysis.tradeQuality || "N/A"}
                    />

                    <Metric
                      title="Bull / Bear"
                      value={`${selectedAnalysis.analysis.bullishScore ?? 0}/${
                        selectedAnalysis.analysis.bearishScore ?? 0
                      }`}
                    />
                  </div>

                  <ImportantCard
                    title="Most Important Thing Right Now"
                    value={
                      selectedAnalysis.analysis.mostImportantThing ||
                      "No key priority saved."
                    }
                  />

                  <DetailCard
                    title="Key Levels"
                    value={selectedAnalysis.analysis.keyLevels || "N/A"}
                  />

                  <DetailCard
                    title="Market Structure"
                    value={selectedAnalysis.analysis.marketStructure || "N/A"}
                  />

                  <div className="grid gap-4 lg:grid-cols-2">
                    <DetailCard
                      title="Bullish Scenario"
                      value={selectedAnalysis.analysis.bullishScenario || "N/A"}
                    />

                    <DetailCard
                      title="Bearish Scenario"
                      value={selectedAnalysis.analysis.bearishScenario || "N/A"}
                    />

                    <DetailCard
                      title="Bullish Conditions"
                      value={
                        selectedAnalysis.analysis.bullishConditions || "N/A"
                      }
                    />

                    <DetailCard
                      title="Bearish Conditions"
                      value={
                        selectedAnalysis.analysis.bearishConditions || "N/A"
                      }
                    />
                  </div>

                  <ImportantCard
                    title="Final Decision"
                    value={
                      selectedAnalysis.analysis.finalDecision ||
                      "No final decision saved."
                    }
                  />
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </p>

      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

function DetailCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="mb-4 rounded-2xl border border-zinc-800 bg-black p-5">
      <h3 className="text-lg font-bold">{title}</h3>

      <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function ImportantCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="mb-4 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-300">
        {title}
      </p>

      <p className="mt-3 text-xl font-bold leading-tight text-white">
        {value}
      </p>
    </div>
  );
}