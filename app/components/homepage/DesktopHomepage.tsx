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

type DesktopHomepageProps = {
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

export default function DesktopHomepage({
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
}: DesktopHomepageProps) {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/history"
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
            >
              History
            </a>

            <a
              href="/dashboard"
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
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
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
                >
                  Upgrade
                </a>
              )
            ) : (
              <div className="h-[46px] w-[110px] rounded-2xl border border-zinc-800 bg-zinc-950" />
            )}

            {!isSignedIn ? (
              <div className="flex gap-3">
                <a
                  href="/sign-in"
                  className="rounded-xl border border-zinc-700 px-5 py-2 text-sm font-bold text-white transition hover:border-white"
                >
                  Sign In
                </a>

                <a
                  href="/sign-up"
                  className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
                >
                  Sign Up
                </a>
              </div>
            ) : (
              <a
                href="/account"
                className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
              >
                Account
              </a>
            )}
          </div>
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
                you plan to hold the trade. The analysis adapts to your trade
                duration instead of giving a generic market overview.
              </p>

              <p className="mt-4 text-sm text-zinc-500">
                This tool does not provide blind buy or sell signals. It helps
                structure market context, scenarios, invalidation and risk.
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
          <div className="flex items-center justify-between gap-5">
            <div>
              <h2 className="text-2xl font-bold">
                Upload Chart Screenshots
              </h2>

              <p className="mt-2 text-zinc-400">
                Upload at least 2 timeframes to run the analysis. More uploads
                usually mean a higher-quality result.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="rounded-2xl bg-black px-5 py-3 text-sm text-zinc-300">
                {uploadedCount}/6 timeframes uploaded
              </div>

              <div className="flex flex-wrap justify-end gap-2">
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
            <h2 className="text-2xl font-bold">
              Planned Trade Duration
            </h2>

            <p className="mt-2 text-zinc-400">
              This tells the AI whether to prioritize lower timeframes for
              scalping or higher timeframes for swing/position trades.
            </p>
          </div>

          <div className="grid grid-cols-5 gap-3">
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

        <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <input
            value={instrument}
            onChange={(event) => setInstrument(event.target.value)}
            placeholder="Instrument / Pair / Ticker (optional) — e.g. EURUSD, AAPL, GOLD, NAS100"
            className="w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-white"
          />
        </section>

        <section className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-6">
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
          disabled={(isPro || canAnalyze) && uploadedCount < 2}
          className={`mt-8 w-full rounded-2xl px-6 py-5 text-lg font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
            canAnalyze || isPro
              ? "bg-white text-black hover:bg-zinc-200"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          {isPro || canAnalyze
            ? uploadedCount >= 2
              ? "Analyze Setup"
              : "Upload at least 2 timeframes to analyze"
            : `Next free analysis in ${remainingHours}h ${remainingMinutes}m ${remainingSeconds}s`}
        </button>

<section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
  <p className="text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
    How It Works
  </p>

  <div className="mt-6 grid grid-cols-3 gap-4">
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 text-sm font-bold">
        1
      </div>

      <h3 className="mt-4 text-lg font-bold">
        Upload Charts
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Add at least two chart screenshots from different timeframes.
      </p>
    </div>

    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 text-sm font-bold">
        2
      </div>

      <h3 className="mt-4 text-lg font-bold">
        Choose Duration
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Select how long you plan to hold the trade so the analysis fits your timeframe.
      </p>
    </div>

    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 text-sm font-bold">
        3
      </div>

      <h3 className="mt-4 text-lg font-bold">
        Review the Decision
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Get structured scenarios, key levels, invalidation and a clear final decision.
      </p>
    </div>
  </div>
</section>

<section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
  <p className="text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
    Why Traders Use It
  </p>

  <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 text-sm font-semibold text-zinc-200">
    <div className="flex items-start gap-3">
      <span className="text-emerald-400">✓</span>
      <span>Analysis adapts to the selected trade duration.</span>
    </div>

    <div className="flex items-start gap-3">
      <span className="text-emerald-400">✓</span>
      <span>Higher and lower timeframes are evaluated together.</span>
    </div>

    <div className="flex items-start gap-3">
      <span className="text-emerald-400">✓</span>
      <span>Bullish and bearish scenarios include clear conditions.</span>
    </div>

    <div className="flex items-start gap-3">
      <span className="text-emerald-400">✓</span>
      <span>WAIT and NO TRADE remain valid outcomes.</span>
    </div>
  </div>
</section>

        <footer className="mt-12 border-t border-zinc-900 pt-6 text-center text-sm text-zinc-600">
          <div className="flex flex-wrap justify-center gap-5">
            <a href="/pricing" className="hover:text-white">
              Pricing
            </a>

            <a href="/terms" className="hover:text-white">
              Terms
            </a>

            <a href="/privacy" className="hover:text-white">
              Privacy
            </a>

            <a href="/disclaimer" className="hover:text-white">
              Risk Disclaimer
            </a>

            <a
              href="mailto:support@chartsetup.app"
              className="hover:text-white"
            >
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