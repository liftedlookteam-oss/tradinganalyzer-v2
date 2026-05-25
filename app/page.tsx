"use client";

import { useState } from "react";
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

const timeframes: {
  key: TimeframeKey;
  title: string;
  description: string;
}[] = [
  {
    key: "daily",
    title: "Daily Chart",
    description: "Best for macro trend, major structure and higher-timeframe bias.",
  },
  {
    key: "h4",
    title: "4H Chart",
    description: "Useful for swing structure, major zones and larger liquidity areas.",
  },
  {
    key: "h2",
    title: "2H Chart",
    description: "Helps refine higher-timeframe context before intraday decisions.",
  },
  {
    key: "h1",
    title: "1H Chart",
    description: "Good for intraday structure, pullbacks and confirmation zones.",
  },
  {
    key: "m15",
    title: "15M Chart",
    description: "Useful for short-term structure, liquidity and timing.",
  },
  {
    key: "m5",
    title: "5M Chart",
    description: "Best for scalping, execution timing and very short-term setups.",
  },
];

const markets = [
  "Forex",
  "Crypto",
  "Futures",
  "Stocks",
  "Options",
  "Indices",
  "Commodities",
];

const tradeDurations = [
  {
    value: "Scalp: 5–30 minutes",
    label: "Scalp",
    description: "5–30 minutes",
  },
  {
    value: "Intraday: 30 minutes–4 hours",
    label: "Intraday",
    description: "30 minutes–4 hours",
  },
  {
    value: "Session trade: same trading day",
    label: "Session",
    description: "Same trading day",
  },
  {
    value: "Swing: 1–5 days",
    label: "Swing",
    description: "1–5 days",
  },
  {
    value: "Position: several days/weeks",
    label: "Position",
    description: "Several days/weeks",
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
  const [tradeDuration, setTradeDuration] = useState("Intraday: 30 minutes–4 hours");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [showResults, setShowResults] = useState(false);

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

    const uploadedFiles = Object.entries(files).filter(([, file]) => file !== null);

    if (uploadedFiles.length < 2) {
      alert("Upload at least 2 timeframe charts before analyzing.");
      return;
    }

    setLoading(true);
    setAnalysis(null);

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
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleNewAnalysis() {
    setShowResults(false);
    setAnalysis(null);

    setFiles({
      daily: null,
      h4: null,
      h2: null,
      h1: null,
      m15: null,
      m5: null,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const uploadedCount = Object.values(files).filter(Boolean).length;
  const canAnalyze = uploadedCount >= 2;

  if (showResults && analysis) {
    return (
      <ResultsView
        analysis={analysis}
        files={files}
        tradeDuration={tradeDuration}
        onNewAnalysis={handleNewAnalysis}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-end">
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
                Upload your chart screenshots by timeframe and choose how long you plan to hold the trade.
                The analysis adapts to your trade duration instead of giving a generic market overview.
              </p>

              <p className="mt-4 text-sm text-zinc-500">
                This tool does not provide blind buy or sell signals. It helps structure market context,
                scenarios, invalidation and risk.
              </p>
            </div>

            <div className="flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Chart Setup Analyzer logo"
                className="max-h-[340px] w-full object-contain"
              />
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Upload Chart Screenshots</h2>

              <p className="mt-2 text-zinc-400">
                Upload at least 2 timeframes to run the analysis. More uploads usually mean a higher-quality result.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <div className="rounded-2xl bg-black px-5 py-3 text-sm text-zinc-300">
                {uploadedCount}/6 timeframes uploaded
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                {markets.map((item) => (
                  <button
                    key={item}
                    onClick={() => setMarket(item)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      market === item
                        ? "bg-white text-black"
                        : "bg-black text-zinc-400 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Planned Trade Duration</h2>
            <p className="mt-2 text-zinc-400">
              This tells the AI whether to prioritize lower timeframes for scalping or higher timeframes for swing/position trades.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {tradeDurations.map((item) => (
              <button
                key={item.value}
                onClick={() => setTradeDuration(item.value)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  tradeDuration === item.value
                    ? "border-white bg-white text-black"
                    : "border-zinc-800 bg-black text-zinc-300 hover:border-zinc-500"
                }`}
              >
                <p className="font-bold">{item.label}</p>
                <p className={`mt-1 text-sm ${tradeDuration === item.value ? "text-zinc-700" : "text-zinc-500"}`}>
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {timeframes.map((timeframe) => (
            <UploadBox
              key={timeframe.key}
              title={timeframe.title}
              description={timeframe.description}
              file={files[timeframe.key]}
              onChange={(file) => handleFileChange(timeframe.key, file)}
            />
          ))}
        </section>

        <button
          onClick={handleAnalyze}
          className="mt-8 w-full rounded-2xl bg-white px-6 py-5 text-lg font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
          disabled={!canAnalyze || loading}
        >
          {loading
            ? "Analyzing setup..."
            : canAnalyze
              ? `Analyze ${market} Setup`
              : "Upload at least 2 timeframes to analyze"}
        </button>
      </div>
    </main>
  );
}

function ResultsView({
  analysis,
  files,
  tradeDuration,
  onNewAnalysis,
}: {
  analysis: Analysis;
  files: UploadedFiles;
  tradeDuration: string;
  onNewAnalysis: () => void;
}) {
  const uploadedPreviews = timeframes
    .map((timeframe) => ({
      ...timeframe,
      file: files[timeframe.key],
    }))
    .filter((item) => item.file);

  return (
    <main className="min-h-screen bg-[#050505] text-white px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Analysis Result
            </p>

            <h1 className="text-4xl font-bold">Trade Decision Dashboard</h1>
          </div>

          <button
            onClick={onNewAnalysis}
            className="w-fit rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
          >
            New Analysis
          </button>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {uploadedPreviews.map((item) => (
            <UploadedPreview
              key={item.key}
              title={item.title}
              file={item.file as File}
            />
          ))}
        </section>

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

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
            Final Decision
          </p>

          <p className="text-2xl font-bold leading-tight text-white">
            {analysis.finalDecision || "No final decision provided."}
          </p>
        </section>
      </div>
    </main>
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
        onChange={(e) => onChange(e.target.files?.[0] || null)}
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

        <p className="mt-3 text-sm leading-6 text-zinc-500">{description}</p>
      </div>

      <div className="mt-6 rounded-2xl bg-black px-4 py-3 text-sm text-zinc-500">
        {file ? "Click to replace image" : "Click to upload"}
      </div>
    </label>
  );
}

function UploadedPreview({ title, file }: { title: string; file: File }) {
  const previewUrl = URL.createObjectURL(file);

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-3">
      <img
        src={previewUrl}
        alt={`${title} uploaded preview`}
        className="h-28 w-full rounded-2xl object-cover"
      />

      <p className="mt-3 text-sm font-semibold text-zinc-300">{title}</p>
    </div>
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

      <p className="mt-4 text-zinc-300 leading-8 whitespace-pre-wrap">
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

        <p className="text-zinc-200 leading-8 whitespace-pre-wrap">
          {scenario || "No scenario provided."}
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-black/50 p-5">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
          What must happen
        </p>

        <p className="text-zinc-200 leading-8 whitespace-pre-wrap">
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

        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <span>Weak</span>
          <span>Strong</span>
        </div>
      </div>
    </div>
  );
}