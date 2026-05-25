"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [deleting, setDeleting] = useState(false);

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
          const saved = data.analyses || [];
          setAnalyses(saved);

          if (saved.length > 0) {
            setSelectedId(saved[0].id);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [isLoaded, isSignedIn]);

  const selectedAnalysis = useMemo(
    () => analyses.find((item) => item.id === selectedId) || null,
    [analyses, selectedId]
  );

  async function deleteAnalysis(id: string) {
    const confirmed = confirm("Delete this saved analysis?");
    if (!confirmed) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/history?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || "Failed to delete analysis.");
        return;
      }

      const updated = analyses.filter((item) => item.id !== id);
      setAnalyses(updated);

      if (selectedId === id) {
        setSelectedId(updated[0]?.id || null);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Saved Setups
            </p>

            <h1 className="text-4xl font-bold tracking-tight">
              Analysis History
            </h1>

            <p className="mt-3 max-w-2xl text-zinc-500">
              Review previous chart analyses, compare decisions, and track your trading context over time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              New Analysis
            </a>

            <UserButton />
          </div>
        </header>

        {loading ? (
          <EmptyState
            title="Loading history..."
            text="Fetching your saved analyses."
            buttonLabel=""
            buttonHref=""
          />
        ) : analyses.length === 0 ? (
          <EmptyState
            title="No saved analyses yet"
            text="Run your first chart analysis and it will appear here."
            buttonLabel="Start Analysis"
            buttonHref="/"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[390px_1fr]">
            <aside className="space-y-4">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
                    Saved
                  </p>

                  <p className="rounded-full bg-black px-3 py-1 text-xs font-bold text-zinc-400">
                    {analyses.length}
                  </p>
                </div>

                <p className="mt-2 text-sm text-zinc-500">
                  Only your own analyses are shown here.
                </p>
              </div>

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
                        {formatDate(item.created_at)}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <SmallStat
                        label="Bias"
                        value={item.analysis.overallBias || "N/A"}
                      />

                      <SmallStat
                        label="Quality"
                        value={item.analysis.tradeQuality || "N/A"}
                      />
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-500">
                      {item.analysis.mostImportantThing || "No summary saved."}
                    </p>
                  </button>
                );
              })}
            </aside>

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
                  <div className="mb-7 flex items-start justify-between gap-6">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
                        Saved Analysis
                      </p>

                      <h2 className="mt-2 text-4xl font-bold">
                        {selectedAnalysis.market}
                      </h2>

                      <p className="mt-2 text-zinc-400">
                        {selectedAnalysis.trade_duration}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <p className="text-sm text-zinc-500">
                        {new Date(selectedAnalysis.created_at).toLocaleString()}
                      </p>

                      <button
                        onClick={() => deleteAnalysis(selectedAnalysis.id)}
                        disabled={deleting}
                        className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:border-red-400 hover:bg-red-500/20 disabled:opacity-40"
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
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

                  <div className="grid gap-4 lg:grid-cols-2">
                    <DetailCard
                      title="Key Levels"
                      value={selectedAnalysis.analysis.keyLevels || "N/A"}
                    />

                    <DetailCard
                      title="Market Structure"
                      value={selectedAnalysis.analysis.marketStructure || "N/A"}
                    />
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <ScenarioCard
                      variant="bullish"
                      title="Bullish Scenario"
                      scenario={selectedAnalysis.analysis.bullishScenario || "N/A"}
                      conditions={
                        selectedAnalysis.analysis.bullishConditions || "N/A"
                      }
                      score={selectedAnalysis.analysis.bullishScore ?? 0}
                    />

                    <ScenarioCard
                      variant="bearish"
                      title="Bearish Scenario"
                      scenario={selectedAnalysis.analysis.bearishScenario || "N/A"}
                      conditions={
                        selectedAnalysis.analysis.bearishConditions || "N/A"
                      }
                      score={selectedAnalysis.analysis.bearishScore ?? 0}
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

function EmptyState({
  title,
  text,
  buttonLabel,
  buttonHref,
}: {
  title: string;
  text: string;
  buttonLabel: string;
  buttonHref: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
      <h2 className="text-2xl font-bold">{title}</h2>

      <p className="mt-3 text-zinc-400">{text}</p>

      {buttonLabel && buttonHref && (
        <a
          href={buttonHref}
          className="mt-6 inline-block rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
        >
          {buttonLabel}
        </a>
      )}
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
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
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <h3 className="text-lg font-bold">{title}</h3>

      <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function ImportantCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="my-4 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-300">
        {title}
      </p>

      <p className="mt-3 text-xl font-bold leading-tight text-white">
        {value}
      </p>
    </div>
  );
}

function ScenarioCard({
  variant,
  title,
  scenario,
  conditions,
  score,
}: {
  variant: "bullish" | "bearish";
  title: string;
  scenario: string;
  conditions: string;
  score: number;
}) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const isBullish = variant === "bullish";

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isBullish
          ? "border-green-600/60 bg-green-900/25"
          : "border-red-600/60 bg-red-900/25"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold">{title}</h3>

        <p className="text-lg font-bold">{safeScore}/100</p>
      </div>

      <div className="mb-4 rounded-2xl bg-black/60 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
          Scenario
        </p>

        <p className="whitespace-pre-wrap leading-7 text-zinc-300">
          {scenario}
        </p>
      </div>

      <div className="rounded-2xl bg-black/60 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
          What must happen
        </p>

        <p className="whitespace-pre-wrap leading-7 text-zinc-300">
          {conditions}
        </p>
      </div>

      <div className="mt-4 h-3 rounded-full bg-zinc-800">
        <div
          className="h-3 rounded-full bg-white"
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}