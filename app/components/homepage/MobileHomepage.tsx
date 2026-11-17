"use client";

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
  usageError: boolean;
  loading: boolean;
  loadingMessage: string;
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
  usageError,
  loading,
  loadingMessage,
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
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto w-full max-w-2xl px-4 pb-8 pt-4">
        <header className="mb-4 grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/history"
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm font-bold text-zinc-200"
            >
              History
            </a>

            <a
              href="/dashboard"
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm font-bold text-zinc-200"
            >
              Trading Dashboard
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {usageLoaded ? (
              isPro ? (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-3 text-sm font-bold text-emerald-300">
                  Pro Active
                </div>
              ) : (
                <a
                  href="/pricing"
                  className="rounded-2xl bg-white px-3 py-3 text-sm font-bold text-black"
                >
                  Upgrade
                </a>
              )
            ) : (
              <div className="h-11 w-20 rounded-2xl border border-zinc-800 bg-zinc-950" />
            )}

            {!isSignedIn ? (
              <>
                <a
                  href="/sign-in"
                  className="rounded-xl border border-zinc-700 px-3 py-3 text-sm font-bold text-white"
                >
                  Sign In
                </a>

                <a
                  href="/sign-up"
                  className="rounded-xl bg-white px-3 py-3 text-sm font-bold text-black"
                >
                  Sign Up
                </a>
              </>
            ) : (
              <a
                href="/account"
                className="rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm font-bold text-zinc-200"
              >
                Account
              </a>
            )}
          </div>
        </header>

        <section className="mb-4 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 shadow-2xl sm:p-6">
          <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
                AI Trading Decision Support
              </p>

              <h1 className="text-[clamp(1.8rem,7vw,2.5rem)] font-bold leading-tight tracking-tight">
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
              className="max-h-28 max-w-full justify-self-center object-contain sm:max-h-40"
            />
          </div>
        </section>

        <section className="mb-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="mb-4 flex flex-wrap items-start gap-3">
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

          <div className="flex flex-wrap gap-2">
            {markets.map((item) => (
              <button
                key={item}
                onClick={() => setMarket(item)}
                    aria-pressed={market === item}
                className={`min-h-11 rounded-full px-3 py-2 text-sm font-semibold ${
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

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {tradeDurations.map((item) => (
              <button
                key={item.value}
                onClick={() => setTradeDuration(item.value)}
                    aria-pressed={tradeDuration === item.value}
                className={`min-w-0 rounded-2xl border p-3 text-left ${
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

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
          onClick={usageError ? () => window.location.reload() : handleAnalyze}
          disabled={loading || !usageLoaded || (!usageError && (!isSignedIn || uploadedCount < 2 || !canAnalyze))}
          className={`mt-4 min-h-12 w-full rounded-2xl px-4 py-4 text-base font-bold disabled:cursor-not-allowed disabled:opacity-40 ${
            canAnalyze || isPro
              ? "bg-white text-black"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {!usageLoaded ? "Checking access…" : usageError ? "Could not check access · Retry" : !isSignedIn ? "Sign in to analyze" : loading && (canAnalyze || isPro) ? "Analyzing…" : isPro || canAnalyze
            ? uploadedCount >= 2
              ? "Analyze Setup"
              : "Upload at least 2 timeframes to analyze"
            : `Next free analysis in ${remainingHours}h ${remainingMinutes}m ${remainingSeconds}s`}
        </button>
        {loading && (
          <p role="status" className="mt-3 text-sm text-zinc-400">{loadingMessage}</p>
        )}
        {!loading && isSignedIn && usageLoaded && !usageError && !canAnalyze && (
          <a href="/pricing" className="mt-3 inline-block text-sm underline">View Pro plans</a>
        )}

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">How It Works</p>
          <div className="mt-4 space-y-3">
            {[
              ["Upload Charts", "Add at least two chart screenshots from different timeframes."],
              ["Choose Duration", "Select how long you plan to hold the trade so the analysis fits your timeframe."],
              ["Review the Decision", "Get structured scenarios, key levels, invalidation and a clear final decision."],
            ].map(([title, description], index) => (
              <div key={title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-2xl border border-zinc-800 bg-black p-3">
                <div className="flex size-8 items-center justify-center rounded-lg border border-zinc-700 text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">Why Traders Use It</p>
          <ul className="mt-4 space-y-3 text-sm font-semibold text-zinc-200">
            {[
              "Analysis adapts to the selected trade duration.",
              "Higher and lower timeframes are evaluated together.",
              "Bullish and bearish scenarios include clear conditions.",
              "WAIT and NO TRADE remain valid outcomes.",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span className="text-emerald-400">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-8 border-t border-zinc-900 pt-5 text-center text-sm text-zinc-600">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
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
    </main>
  );
}