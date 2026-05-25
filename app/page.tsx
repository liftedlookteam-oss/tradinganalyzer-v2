"use client";

import { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";

type TimeframeKey = "daily" | "h4" | "h2" | "h1" | "m15" | "m5";

type UploadedFiles = {
  daily: File | null;
  h4: File | null;
  h2: File | null;
  h1: File | null;
  m15: File | null;
  m5: File | null;
};

type Analysis = {
  overallBias: string;
  tradeQuality: string;
  mostImportantThing: string;
  keyLevels: string;
  marketStructure: string;
  bullishScenario: string;
  bullishConditions: string;
  bearishScenario: string;
  bearishConditions: string;
  bullishScore: number;
  bearishScore: number;
  scoreReason: string;
  finalDecision: string;
};

const tradeStatuses = ["Not taken", "Planned", "Taken", "Skipped"];
const tradeResults = ["Pending", "Win", "Loss", "Breakeven"];
const emotions = [
  "Calm",
  "FOMO",
  "Impatient",
  "Revenge",
  "Confident",
  "Unclear",
];

const loadingMessages = [
  "Analyzing market structure...",
  "Checking timeframe alignment...",
  "Evaluating liquidity context...",
  "Scanning bullish and bearish scenarios...",
  "Comparing higher and lower timeframe bias...",
  "Building final trade assessment...",
];

const timeframes: {
  key: TimeframeKey;
  title: string;
  description: string;
}[] = [
  {
    key: "daily",
    title: "Daily Chart",
    description:
      "Best for macro trend, major structure and higher-timeframe bias.",
  },
  {
    key: "h4",
    title: "4H Chart",
    description:
      "Useful for swing structure, major zones and larger liquidity areas.",
  },
  {
    key: "h2",
    title: "2H Chart",
    description:
      "Helps refine higher-timeframe context before intraday decisions.",
  },
  {
    key: "h1",
    title: "1H Chart",
    description:
      "Good for intraday structure, pullbacks and confirmation zones.",
  },
  {
    key: "m15",
    title: "15M Chart",
    description:
      "Useful for short-term structure, liquidity and timing.",
  },
  {
    key: "m5",
    title: "5M Chart",
    description:
      "Best for scalping, execution timing and very short-term setups.",
  },
];

export default function Home() {
  const { isSignedIn } = useUser();

  const [files, setFiles] = useState<UploadedFiles>({
    daily: null,
    h4: null,
    h2: null,
    h1: null,
    m15: null,
    m5: null,
  });

  const [market, setMarket] = useState("Forex");

  const [tradeDuration, setTradeDuration] = useState(
    "Intraday: 30 minutes–4 hours"
  );

  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const [showResults, setShowResults] = useState(false);

  const [tradeStatus, setTradeStatus] = useState("Not taken");
  const [tradeResult, setTradeResult] = useState("Pending");
  const [riskAmount, setRiskAmount] = useState("");
  const [riskPercent, setRiskPercent] = useState("");
  const [emotion, setEmotion] = useState("");
  const [journalNotes, setJournalNotes] = useState("");

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [loading]);

  async function saveJournal(
    updates?: Partial<{
      tradeStatus: string;
      tradeResult: string;
      riskAmount: string;
      riskPercent: string;
      emotion: string;
      journalNotes: string;
    }>
  ) {
    if (!analysisId) return;

    try {
      await fetch("/api/history", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: analysisId,
          trade_status: updates?.tradeStatus ?? tradeStatus,
          trade_result: updates?.tradeResult ?? tradeResult,
          risk_amount: updates?.riskAmount ?? riskAmount,
          risk_percent: updates?.riskPercent ?? riskPercent,
          emotion: updates?.emotion ?? emotion,
          journal_notes: updates?.journalNotes ?? journalNotes,
        }),
      });
    } catch {}
  }

  function handleFileChange(key: TimeframeKey, file: File | null) {
    setFiles((prev) => ({
      ...prev,
      [key]: file,
    }));
  }

  async function handleAnalyze() {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }

    const uploadedFiles = Object.entries(files).filter(
      ([, file]) => file !== null
    );

    if (uploadedFiles.length < 2) {
      alert("Upload at least 2 timeframe charts before analyzing.");
      return;
    }

    setLoading(true);
    setLoadingIndex(0);

    const formData = new FormData();

    formData.append("market", market);
    formData.append("tradeDuration", tradeDuration);

    for (const [key, file] of uploadedFiles) {
      if (file) {
        formData.append(key, file);
      }
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Analysis failed.");
        return;
      }

      setAnalysis(data.analysis);
      setAnalysisId(data.analysisId);

      setTradeStatus("Not taken");
      setTradeResult("Pending");
      setRiskAmount("");
      setRiskPercent("");
      setEmotion("");
      setJournalNotes("");

      setShowResults(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch {
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleNewAnalysis() {
    setShowResults(false);
    setAnalysis(null);
    setAnalysisId(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const uploadedCount = Object.values(files).filter(Boolean).length;
  const canAnalyze = uploadedCount >= 2;

  if (showResults && analysis) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Analysis Result
              </p>

              <h1 className="text-4xl font-bold">
                Trade Decision Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/history"
                className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
              >
                History
              </a>

              <button
                onClick={handleNewAnalysis}
                className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
              >
                New Analysis
              </button>
            </div>
          </div>

          <section className="mb-6 grid gap-5 md:grid-cols-3">
            <TopMetric title="Overall Bias" value={analysis.overallBias} />
            <TopMetric title="Trade Quality" value={analysis.tradeQuality} />
            <TopMetric title="Trade Duration" value={tradeDuration} />
          </section>

          <section className="mb-6 grid gap-6 lg:grid-cols-2">
            <SimpleCard title="Key Levels" value={analysis.keyLevels} />
            <SimpleCard title="Market Structure" value={analysis.marketStructure} />
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

          <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
              Final Decision
            </p>

            <p className="text-2xl font-bold leading-tight text-white">
              {analysis.finalDecision}
            </p>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-5">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
                Trade Decision Journal
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Execution Notes
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <JournalSelect
                label="Trade Status"
                value={tradeStatus}
                options={tradeStatuses}
                onChange={(value) => {
                  setTradeStatus(value);
                  saveJournal({ tradeStatus: value });
                }}
              />

              <JournalSelect
                label="Trade Result"
                value={tradeResult}
                options={tradeResults}
                onChange={(value) => {
                  setTradeResult(value);
                  saveJournal({ tradeResult: value });
                }}
              />

              <JournalSelect
                label="Emotion"
                value={emotion}
                options={["", ...emotions]}
                onChange={(value) => {
                  setEmotion(value);
                  saveJournal({ emotion: value });
                }}
              />

              <JournalInput
                label="Risk Amount"
                value={riskAmount}
                placeholder="Example: 50€"
                onChange={(value) => {
                  setRiskAmount(value);
                  saveJournal({ riskAmount: value });
                }}
              />

              <JournalInput
                label="Risk %"
                value={riskPercent}
                placeholder="Example: 1%"
                onChange={(value) => {
                  setRiskPercent(value);
                  saveJournal({ riskPercent: value });
                }}
              />
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Notes
              </label>

              <textarea
                value={journalNotes}
                onChange={(e) => {
                  setJournalNotes(e.target.value);
                  saveJournal({ journalNotes: e.target.value });
                }}
                placeholder="Why did you take, skip, or plan this trade?"
                className="mt-2 min-h-32 w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white"
              />
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between">
          <a
            href="/history"
            className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
          >
            History
          </a>

          {!isSignedIn ? (
            <div className="flex gap-3">
              <a
                href="/sign-in"
                className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
              >
                Sign In
              </a>

              <a
                href="/sign-up"
                className="rounded-xl border border-zinc-700 px-5 py-2 text-sm font-bold text-white transition hover:border-white"
              >
                Sign Up
              </a>
            </div>
          ) : (
            <UserButton />
          )}
        </header>

        <section className="mb-10 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-8 shadow-2xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
            <div className="max-w-4xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
                AI Trading Decision Support
              </p>

              <h1 className="text-5xl font-bold tracking-tight">
                Chart Setup Analyzer
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-400">
                Upload your chart screenshots by timeframe and choose how long
                you plan to hold the trade.
              </p>
            </div>
          </div>
        </section>
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
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white"
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
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white"
      />
    </div>
  );
}

function TopMetric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold">{value || "N/A"}</p>
    </div>
  );
}

function SimpleCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
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