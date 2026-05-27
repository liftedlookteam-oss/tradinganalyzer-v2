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
  marketState: string;
  noTradeReason: string;
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

const loadingMessages = [
  "Reading uploaded charts...",
  "Checking timeframe alignment...",
  "Detecting market state...",
  "Evaluating liquidity context...",
  "Building bullish and bearish scenarios...",
  "Preparing final decision...",
];

const timeframes = [
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
] as const;

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
  const [instrument, setInstrument] = useState("");
  const [tradeDuration, setTradeDuration] = useState(
    "Intraday: 30 minutes–4 hours"
  );

  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [showResults, setShowResults] = useState(false);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
    setAnalysis(null);

    const formData = new FormData();

    formData.append("market", market);
    formData.append("instrument", instrument.trim());
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
        if (data.code === "FREE_LIMIT_REACHED") {
          setShowUpgradeModal(true);
          return;
        }

        alert(data.error || "Analysis failed.");
        return;
      }

      setAnalysis(data.analysis);
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

  return (
    <>
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

              <div className="flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="max-h-[340px] w-full object-contain"
                />
              </div>
            </div>
          </section>

          <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Upload Chart Screenshots
                </h2>

                <p className="mt-2 text-zinc-400">
                  Upload at least 2 timeframes to run the analysis.
                </p>
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
          </section>

          <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
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

                  <p
                    className={`mt-1 text-sm ${
                      tradeDuration === item.value
                        ? "text-zinc-700"
                        : "text-zinc-500"
                    }`}
                  >
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <input
              value={instrument}
              onChange={(event) => setInstrument(event.target.value)}
              placeholder="Instrument / Pair / Ticker (optional)"
              className="w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-white"
            />
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
            className="mt-8 w-full rounded-2xl bg-white px-6 py-5 text-lg font-bold text-black transition hover:bg-zinc-200"
          >
            Analyze Setup
          </button>
        </div>
      </main>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-7 shadow-2xl">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
              Free Limit Reached
            </p>

            <h2 className="text-3xl font-bold">
              You already used your free daily analysis.
            </h2>

            <p className="mt-4 leading-8 text-zinc-400">
              Upgrade to Pro for unlimited chart analyses, full history and
              priority AI processing.
            </p>

            <div className="mt-6 grid gap-3">
              <button className="rounded-2xl bg-white px-5 py-4 text-lg font-bold text-black transition hover:bg-zinc-200">
                Pro Weekly — €4.99
              </button>

              <button className="rounded-2xl border border-zinc-700 bg-black px-5 py-4 text-lg font-bold text-white transition hover:border-white">
                Pro Monthly — €14.99
              </button>
            </div>

            <button
              onClick={() => setShowUpgradeModal(false)}
              className="mt-5 w-full rounded-2xl border border-zinc-800 px-5 py-3 text-sm font-bold text-zinc-400 transition hover:border-zinc-600 hover:text-white"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </>
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

        <h3 className="text-xl font-bold">
          {title}
        </h3>

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