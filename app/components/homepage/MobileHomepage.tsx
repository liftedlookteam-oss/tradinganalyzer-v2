"use client";

import { useEffect, useRef, useState } from "react";
import UploadBox from "./UploadBox";

type TimeframeKey =
  | "weekly"
  | "daily"
  | "h4"
  | "h2"
  | "h1"
  | "m15"
  | "m5";

type UploadedFiles = Record<TimeframeKey, File | null>;

type TimeframeItem = {
  key: TimeframeKey;
  title: string;
  description: string;
};

type MobileHomepageProps = {
  isSignedIn: boolean;
  usageLoaded: boolean;
  isPro: boolean;
  canAnalyze: boolean;
  uploadedCount: number;
  market: string;
  setMarket: (value: string) => void;
  instrument: string;
  setInstrument: (value: string) => void;
  tradeDuration: string;
  setTradeDuration: (value: string) => void;
  timeframes: readonly TimeframeItem[];
  files: UploadedFiles;
  handleFileChange: (key: TimeframeKey, file: File | null) => void;
  handleAnalyze: () => void;
  remainingHours: number;
  remainingMinutes: number;
  remainingSeconds: number;
};

const CANVAS_WIDTH = 820;

const markets = [
  "Forex",
  "Crypto",
  "Futures",
  "Stocks",
  "Options",
  "Index",
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
    value: "Position: several weeks/months",
    label: "Position",
    description: "Several weeks/months",
  },
];

export default function MobileHomepage({
  isSignedIn,
  usageLoaded,
  isPro,
  canAnalyze,
  uploadedCount,
  market,
  setMarket,
  instrument,
  setInstrument,
  tradeDuration,
  setTradeDuration,
  timeframes,
  files,
  handleFileChange,
  handleAnalyze,
  remainingHours,
  remainingMinutes,
  remainingSeconds,
}: MobileHomepageProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState(0);

  useEffect(() => {
    const updateCanvas = () => {
      const availableWidth = window.innerWidth - 10;

      const nextScale = Math.min(
        1,
        Math.max(0.35, availableWidth / CANVAS_WIDTH)
      );

      setScale(nextScale);

      if (canvasRef.current) {
        setScaledHeight(canvasRef.current.scrollHeight * nextScale);
      }
    };

    updateCanvas();

    const resizeObserver = new ResizeObserver(updateCanvas);

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    window.addEventListener("resize", updateCanvas);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCanvas);
    };
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <div
        className="relative mx-auto overflow-hidden"
        style={{
          height: scaledHeight || "auto",
        }}
      >
        <div
          ref={canvasRef}
          className="absolute left-1/2 top-0 w-[820px] px-3 py-4"
          style={{
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          <header className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <a
                href="/history"
                className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200"
              >
                History
              </a>

              <a
                href="/dashboard"
                className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200"
              >
                Trading Dashboard
              </a>
            </div>

            <div className="flex items-center gap-3">
              {usageLoaded ? (
                isPro ? (
                  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-300">
                    Pro Active
                  </div>
                ) : (
                  <a
                    href="/pricing"
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black"
                  >
                    Upgrade
                  </a>
                )
              ) : (
                <div className="h-[46px] w-[110px] rounded-2xl border border-zinc-800 bg-zinc-950" />
              )}

              {!isSignedIn ? (
                <>
                  <a
                    href="/sign-in"
                    className="rounded-xl border border-zinc-700 px-5 py-2 text-sm font-bold text-white"
                  >
                    Sign In
                  </a>

                  <a
                    href="/sign-up"
                    className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-black"
                  >
                    Sign Up
                  </a>
                </>
              ) : (
                <a
                  href="/account"
                  className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200"
                >
                  Account
                </a>
              )}
            </div>
          </header>

          <section className="mb-4 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-6 shadow-2xl">
            <div className="grid grid-cols-[1fr_270px] items-center gap-5">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  AI Trading Decision Support
                </p>

                <h1 className="text-4xl font-bold tracking-tight">
                  Chart Setup Analyzer
                </h1>

                <p className="mt-4 text-base leading-7 text-zinc-400">
                  Upload your chart screenshots by timeframe and choose how long
                  you plan to hold the trade. The analysis adapts to your trade
                  duration instead of giving a generic market overview.
                </p>

                <p className="mt-4 text-sm text-zinc-500">
                  This tool does not provide blind buy or sell signals. It helps
                  structure market context, scenarios, invalidation and risk.
                </p>
              </div>

              <img
                src="/logo.png"
                alt="Chart Setup Analyzer logo"
                className="max-h-[250px] w-full object-contain"
              />
            </div>
          </section>

          <section className="mb-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Upload Chart Screenshots
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                  Upload at least 2 timeframes. More uploads usually improve the
                  result.
                </p>
              </div>

              <div className="shrink-0 rounded-2xl bg-black px-5 py-3 text-sm text-zinc-300">
                {uploadedCount}/6 uploaded
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {markets.map((item) => (
                <button
                  key={item}
                  onClick={() => setMarket(item)}
                  className={`rounded-full px-2 py-2 text-sm font-semibold ${
                    market === item
                      ? "bg-white text-black"
                      : "bg-black text-zinc-400"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">
                Planned Trade Duration
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Select how long you expect to hold the trade.
              </p>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {tradeDurations.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setTradeDuration(item.value)}
                  className={`rounded-2xl border px-4 py-4 text-left ${
                    tradeDuration === item.value
                      ? "border-white bg-white text-black"
                      : "border-zinc-800 bg-black text-zinc-300"
                  }`}
                >
                  <p className="font-bold">
                    {item.label}
                  </p>

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

          <section className="mb-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <input
              value={instrument}
              onChange={(event) => setInstrument(event.target.value)}
              placeholder="Instrument / Pair / Ticker — e.g. EURUSD, AAPL, GOLD"
              className="w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-white"
            />
          </section>

          <section className="grid grid-cols-6 gap-3">
            {timeframes.map((timeframe) => (
              <UploadBox
                key={timeframe.key}
                title={timeframe.title}
                description={timeframe.description}
                file={files[timeframe.key]}
                compact
                onChange={(file) =>
                  handleFileChange(timeframe.key, file)
                }
              />
            ))}
          </section>

          <button
            onClick={handleAnalyze}
            disabled={(isPro || canAnalyze) && uploadedCount < 2}
            className={`mt-4 w-full rounded-2xl px-6 py-5 text-lg font-bold disabled:cursor-not-allowed disabled:opacity-40 ${
              canAnalyze || isPro
                ? "bg-white text-black"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {isPro || canAnalyze
              ? uploadedCount >= 2
                ? "Analyze Setup"
                : "Upload at least 2 timeframes to analyze"
              : `Next free analysis in ${remainingHours}h ${remainingMinutes}m ${remainingSeconds}s`}
          </button>

          <footer className="mt-8 border-t border-zinc-900 pt-5 text-center text-sm text-zinc-600">
            <div className="flex justify-center gap-5">
              <a href="/pricing">
                Pricing
              </a>

              <a href="/terms">
                Terms
              </a>

              <a href="/privacy">
                Privacy
              </a>

              <a href="/disclaimer">
                Risk Disclaimer
              </a>

              <a href="mailto:support@chartsetup.app">
                Contact
              </a>
            </div>

            <p className="mt-4">
              © 2026 ChartSetup Analyzer. Decision-support only. Not financial advice.
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}