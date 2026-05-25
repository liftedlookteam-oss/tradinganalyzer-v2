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

const timeframes = [
  {
    key: "daily" as TimeframeKey,
    title: "Daily Chart",
    description:
      "Best for macro trend, major structure and higher-timeframe bias.",
  },
  {
    key: "h4" as TimeframeKey,
    title: "4H Chart",
    description:
      "Useful for swing structure, major zones and larger liquidity areas.",
  },
  {
    key: "h2" as TimeframeKey,
    title: "2H Chart",
    description:
      "Helps refine higher-timeframe context before intraday decisions.",
  },
  {
    key: "h1" as TimeframeKey,
    title: "1H Chart",
    description:
      "Good for intraday structure, pullbacks and confirmation zones.",
  },
  {
    key: "m15" as TimeframeKey,
    title: "15M Chart",
    description:
      "Useful for short-term structure, liquidity and timing.",
  },
  {
    key: "m5" as TimeframeKey,
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

  const [savingJournal, setSavingJournal] = useState(false);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [loading]);

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

  async function saveJournal() {
    if (!analysisId) return;

    setSavingJournal(true);

    try {
      const response = await fetch("/api/history", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: analysisId,
          trade_status: tradeStatus,
          trade_result: tradeResult,
          risk_amount: riskAmount,
          risk_percent: riskPercent,
          emotion,
          journal_notes: journalNotes,
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

  function handleNewAnalysis() {
    setShowResults(false);
    setAnalysis(null);
    setAnalysisId(null);

    setFiles({
      daily: null,
      h4: null,
      h2: null,
      h1: null,
      m15: null,
      m5: null,
    });

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

          <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
                  Trade Decision Journal
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Execution Notes
                </h2>
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
                value={tradeStatus}
                options={tradeStatuses}
                onChange={setTradeStatus}
              />

              <JournalSelect
                label="Trade Result"
                value={tradeResult}
                options={tradeResults}
                onChange={setTradeResult}
              />

              <JournalSelect
                label="Emotion"
                value={emotion}
                options={["", ...emotions]}
                onChange={setEmotion}
              />

              <JournalInput
                label="Risk Amount"
                value={riskAmount}
                placeholder="Example: 50€"
                onChange={setRiskAmount}
              />

              <JournalInput
                label="Risk %"
                value={riskPercent}
                placeholder="Example: 1%"
                onChange={setRiskPercent}
              />
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Notes
              </label>

              <textarea
                value={journalNotes}
                onChange={(e) => setJournalNotes(e.target.value)}
                placeholder="Why did you take, skip, or plan this trade?"
                className="mt-2 min-h-32 w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white"
              />
            </div>
          </section>

          <section className="mb-6 grid gap-5 md:grid-cols-3">
            <Metric title="Overall Bias" value={analysis.overallBias} />
            <Metric title="Trade Quality" value={analysis.tradeQuality} />
            <Metric title="Trade Duration" value={tradeDuration} />
          </section>

          <ImportantCard
            title="Most Important Thing Right Now"
            value={analysis.mostImportantThing}
          />
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

        <section className="mb-10 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-8">
          <h1 className="text-5xl font-bold tracking-tight">
            Chart Setup Analyzer
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-400">
            Upload your chart screenshots by timeframe and choose how long you
            plan to hold the trade.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {timeframes.map((timeframe) => (
            <UploadBox
              key={timeframe.key}
              title={timeframe.title}
              description={timeframe.description}
              file={files[timeframe.key]}
              onChange={(file) =>
                handleFileChange(timeframe.key, file)
              }
            />
          ))}
        </section>

        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze || loading}
          className="mt-8 w-full rounded-2xl bg-white px-6 py-5 text-lg font-bold text-black transition hover:bg-zinc-200 disabled:opacity-30"
        >
          {loading
            ? loadingMessages[loadingIndex]
            : "Analyze Setup"}
        </button>
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

function Metric({
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

      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}

function ImportantCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <section className="mb-6 rounded-3xl border border-yellow-500/40 bg-yellow-500/10 p-7">
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-yellow-300">
        {title}
      </p>

      <p className="text-2xl font-bold leading-tight text-white">
        {value}
      </p>
    </section>
  );
}

function UploadBox({
  title,
  description,
  file,
  onChange,
}: {
  title: string;
  description: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <label className="flex min-h-[260px] cursor-pointer flex-col justify-between rounded-3xl border-2 border-dashed border-zinc-700 bg-zinc-950 p-5 transition hover:border-white hover:bg-zinc-900">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          onChange(e.target.files?.[0] || null)
        }
      />

      <div>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${title} preview`}
            className="mb-5 h-28 w-full rounded-2xl border border-zinc-800 object-cover"
          />
        ) : (
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-black">
            ↑
          </div>
        )}

        <h3 className="text-xl font-bold">{title}</h3>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          {description}
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-black px-4 py-3 text-sm text-zinc-500">
        {file ? "Click to replace image" : "Click to upload"}
      </div>
    </label>
  );
}