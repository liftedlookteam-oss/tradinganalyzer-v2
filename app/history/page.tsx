"use client";

import { useEffect, useMemo, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";

type SavedAnalysis = {
  id: string;
  created_at: string;
  market: string;
  trade_duration: string;
  trade_status?: string;
  trade_result?: string;
  risk_amount?: string;
  risk_percent?: string;
  emotion?: string;
  journal_notes?: string;
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

const tradeStatuses = ["Not taken", "Planned", "Taken", "Skipped"];
const tradeResults = ["Pending", "Win", "Loss", "Breakeven"];
const emotions = ["Calm", "FOMO", "Impatient", "Revenge", "Confident", "Unclear"];

export default function HistoryPage() {
  const { isSignedIn, isLoaded } = useUser();

  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingJournal, setSavingJournal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [marketFilter, setMarketFilter] = useState("All");
  const [biasFilter, setBiasFilter] = useState("All");
  const [qualityFilter, setQualityFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

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

  const markets = useMemo(() => {
    return ["All", ...Array.from(new Set(analyses.map((item) => item.market)))];
  }, [analyses]);

  const filteredAnalyses = useMemo(() => {
    const query = search.toLowerCase().trim();

    return analyses
      .filter((item) => {
        const combined = [
          item.market,
          item.trade_duration,
          item.trade_status,
          item.trade_result,
          item.emotion,
          item.journal_notes,
          item.analysis.overallBias,
          item.analysis.tradeQuality,
          item.analysis.mostImportantThing,
          item.analysis.finalDecision,
          item.analysis.keyLevels,
          item.analysis.marketStructure,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch = !query || combined.includes(query);
        const matchesMarket =
          marketFilter === "All" || item.market === marketFilter;
        const matchesBias =
          biasFilter === "All" || item.analysis.overallBias === biasFilter;
        const matchesQuality =
          qualityFilter === "All" ||
          item.analysis.tradeQuality === qualityFilter;

        return matchesSearch && matchesMarket && matchesBias && matchesQuality;
      })
      .sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();

        return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
      });
  }, [analyses, search, marketFilter, biasFilter, qualityFilter, sortOrder]);

  const selectedAnalysis = useMemo(
    () => filteredAnalyses.find((item) => item.id === selectedId) || null,
    [filteredAnalyses, selectedId]
  );

  useEffect(() => {
    if (filteredAnalyses.length === 0) {
      setSelectedId(null);
      return;
    }

    const stillExists = filteredAnalyses.some((item) => item.id === selectedId);

    if (!stillExists) {
      setSelectedId(filteredAnalyses[0].id);
    }
  }, [filteredAnalyses, selectedId]);

  function updateSelectedField(field: keyof SavedAnalysis, value: string) {
    if (!selectedAnalysis) return;

    setAnalyses((prev) =>
      prev.map((item) =>
        item.id === selectedAnalysis.id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  async function saveJournal() {
    if (!selectedAnalysis) return;

    setSavingJournal(true);

    try {
      const response = await fetch("/api/history", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedAnalysis.id,
          trade_status: selectedAnalysis.trade_status || "Not taken",
          trade_result: selectedAnalysis.trade_result || "Pending",
          risk_amount: selectedAnalysis.risk_amount || "",
          risk_percent: selectedAnalysis.risk_percent || "",
          emotion: selectedAnalysis.emotion || "",
          journal_notes: selectedAnalysis.journal_notes || "",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || "Failed to save journal.");
        return;
      }

      alert("Journal saved.");
    } finally {
      setSavingJournal(false);
    }
  }

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
              Search, filter, review and journal your trading decisions.
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
          <div className="grid gap-6 lg:grid-cols-[410px_1fr]">
            <aside className="space-y-4">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
                    Saved
                  </p>

                  <p className="rounded-full bg-black px-3 py-1 text-xs font-bold text-zinc-400">
                    {filteredAnalyses.length}/{analyses.length}
                  </p>
                </div>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search analyses..."
                  className="mt-4 w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white"
                />

                <div className="mt-4 grid gap-3">
                  <select
                    value={marketFilter}
                    onChange={(event) => setMarketFilter(event.target.value)}
                    className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white"
                  >
                    {markets.map((market) => (
                      <option key={market} value={market}>
                        Market: {market}
                      </option>
                    ))}
                  </select>

                  <select
                    value={biasFilter}
                    onChange={(event) => setBiasFilter(event.target.value)}
                    className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white"
                  >
                    <option value="All">Bias: All</option>
                    <option value="Bullish">Bias: Bullish</option>
                    <option value="Bearish">Bias: Bearish</option>
                    <option value="Neutral">Bias: Neutral</option>
                    <option value="Unclear">Bias: Unclear</option>
                  </select>

                  <select
                    value={qualityFilter}
                    onChange={(event) => setQualityFilter(event.target.value)}
                    className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white"
                  >
                    <option value="All">Quality: All</option>
                    <option value="Good">Quality: Good</option>
                    <option value="Moderate">Quality: Moderate</option>
                    <option value="Bad">Quality: Bad</option>
                    <option value="No Trade">Quality: No Trade</option>
                  </select>

                  <select
                    value={sortOrder}
                    onChange={(event) =>
                      setSortOrder(event.target.value as "newest" | "oldest")
                    }
                    className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white"
                  >
                    <option value="newest">Sort: Newest first</option>
                    <option value="oldest">Sort: Oldest first</option>
                  </select>
                </div>
              </div>

              {filteredAnalyses.length === 0 ? (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="font-bold">No matches</p>

                  <p className="mt-2 text-sm text-zinc-500">
                    Try changing your filters or search term.
                  </p>
                </div>
              ) : (
                filteredAnalyses.map((item) => {
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
                          label="Status"
                          value={item.trade_status || "Not taken"}
                        />
                      </div>

                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-500">
                        {item.analysis.mostImportantThing ||
                          "No summary saved."}
                      </p>
                    </button>
                  );
                })
              )}
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

                  <section className="mb-6 rounded-3xl border border-zinc-800 bg-black p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
                          Trade Decision Journal
                        </p>

                        <h3 className="mt-2 text-2xl font-bold">
                          Execution Notes
                        </h3>
                      </div>

                      <button
                        onClick={saveJournal}
                        disabled={savingJournal}
                        className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:opacity-40"
                      >
                        {savingJournal ? "Saving..." : "Save Journal"}
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <JournalSelect
                        label="Trade Status"
                        value={selectedAnalysis.trade_status || "Not taken"}
                        options={tradeStatuses}
                        onChange={(value) =>
                          updateSelectedField("trade_status", value)
                        }
                      />

                      <JournalSelect
                        label="Trade Result"
                        value={selectedAnalysis.trade_result || "Pending"}
                        options={tradeResults}
                        onChange={(value) =>
                          updateSelectedField("trade_result", value)
                        }
                      />

                      <JournalSelect
                        label="Emotion"
                        value={selectedAnalysis.emotion || ""}
                        options={["", ...emotions]}
                        onChange={(value) =>
                          updateSelectedField("emotion", value)
                        }
                      />

                      <JournalInput
                        label="Risk Amount"
                        placeholder="Example: 50€"
                        value={selectedAnalysis.risk_amount || ""}
                        onChange={(value) =>
                          updateSelectedField("risk_amount", value)
                        }
                      />

                      <JournalInput
                        label="Risk %"
                        placeholder="Example: 1%"
                        value={selectedAnalysis.risk_percent || ""}
                        onChange={(value) =>
                          updateSelectedField("risk_percent", value)
                        }
                      />
                    </div>

                    <div className="mt-4">
                      <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                        Notes
                      </label>

                      <textarea
                        value={selectedAnalysis.journal_notes || ""}
                        onChange={(event) =>
                          updateSelectedField(
                            "journal_notes",
                            event.target.value
                          )
                        }
                        placeholder="Why did you take, skip, or plan this trade?"
                        className="mt-2 min-h-32 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white"
                      />
                    </div>
                  </section>

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
                      value={
                        selectedAnalysis.analysis.marketStructure || "N/A"
                      }
                    />
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <ScenarioCard
                      variant="bullish"
                      title="Bullish Scenario"
                      scenario={
                        selectedAnalysis.analysis.bullishScenario || "N/A"
                      }
                      conditions={
                        selectedAnalysis.analysis.bullishConditions || "N/A"
                      }
                      score={selectedAnalysis.analysis.bullishScore ?? 0}
                    />

                    <ScenarioCard
                      variant="bearish"
                      title="Bearish Scenario"
                      scenario={
                        selectedAnalysis.analysis.bearishScenario || "N/A"
                      }
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

function JournalSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-white"
      >
        {options.map((item) => (
          <option key={item || "none"} value={item}>
            {item || "Select"}
          </option>
        ))}
      </select>
    </div>
  );
}

function JournalInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white"
      />
    </div>
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