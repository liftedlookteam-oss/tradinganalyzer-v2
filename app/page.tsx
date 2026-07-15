"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";

type TimeframeKey = "weekly" | "daily" | "h4" | "h2" | "h1" | "m15" | "m5";

type UploadedFiles = Record<TimeframeKey, File | null>;

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

const scalpTimeframes = [
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
      "Useful for short-term structure, liquidity and execution timing.",
  },
  {
    key: "m5",
    title: "5M Chart",
    description:
      "Best for scalping, execution timing and very short-term setups.",
  },
] as const;

const standardTimeframes = [
  {
    key: "weekly",
    title: "Weekly Chart",
    description:
      "Best for macro trend, major swing structure and long-term liquidity zones.",
  },
  {
    key: "daily",
    title: "Daily Chart",
    description:
      "Best for higher-timeframe bias, key support/resistance and overall market direction.",
  },
  {
    key: "h4",
    title: "4H Chart",
    description:
      "Useful for swing structure, pullbacks and major continuation or reversal zones.",
  },
  {
    key: "h2",
    title: "2H Chart",
    description:
      "Helps refine the move between higher-timeframe structure and execution context.",
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
      "Useful for execution timing, lower-timeframe structure and confirmation.",
  },
] as const;


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

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();

  const [files, setFiles] = useState<UploadedFiles>({
    weekly: null,
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

const selectedDuration = tradeDuration.toLowerCase();

const timeframes =
  selectedDuration.includes("scalp") ? scalpTimeframes : standardTimeframes;

  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [showResults, setShowResults] = useState(false);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [isPro, setIsPro] = useState(false);
  const [usageLoaded, setUsageLoaded] = useState(false);
  const [canAnalyze, setCanAnalyze] = useState(false);

  const [remainingHours, setRemainingHours] = useState(0);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const analysisFinishedRef = useRef(false);
  const mobileCanvasRef = useRef<HTMLDivElement>(null);
  const [mobileScale, setMobileScale] = useState(1);
  const [mobileCanvasHeight, setMobileCanvasHeight] = useState(0);

  useEffect(() => {
    const canvas = mobileCanvasRef.current;
    if (!canvas) return;

    const updateMobileCanvas = () => {
      const scale = Math.min(window.innerWidth / 820, 1);
      setMobileScale(scale);
      setMobileCanvasHeight(canvas.scrollHeight * scale);
    };

    updateMobileCanvas();

    const resizeObserver = new ResizeObserver(updateMobileCanvas);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", updateMobileCanvas);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateMobileCanvas);
    };
  }, [usageLoaded, isSignedIn, isPro, files, tradeDuration]);

  useEffect(() => {
    async function checkUsage() {
      try {
        const response = await fetch("/api/usage");

        if (!response.ok) return;

        const data = await response.json();

        setIsPro(Boolean(data.isPro));
        setCanAnalyze(Boolean(data.canAnalyze));

        if (!data.canAnalyze) {
          setRemainingHours(data.remainingHours || 0);
          setRemainingMinutes(data.remainingMinutes || 0);
          setRemainingSeconds(data.remainingSeconds || 0);
        }
      } catch {
      } finally {
        setUsageLoaded(true);
      }
    }

    checkUsage();
  }, []);

  useEffect(() => {
    if (!loading) return;

    analysisFinishedRef.current = false;

    const interval = setInterval(() => {
      setLoadingIndex((prev) => {
        if (analysisFinishedRef.current) return prev;

        if (prev >= loadingMessages.length - 1) {
          return prev;
        }

        return prev + 1;
      });
    }, 1700);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (canAnalyze || isPro) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev > 0) return prev - 1;

        if (remainingMinutes > 0) {
          setRemainingMinutes((m) => m - 1);
          return 59;
        }

        if (remainingHours > 0) {
          setRemainingHours((h) => h - 1);
          setRemainingMinutes(59);
          return 59;
        }

        setCanAnalyze(true);
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [canAnalyze, isPro, remainingHours, remainingMinutes]);

  function handleFileChange(key: TimeframeKey, file: File | null) {
    setFiles((prev) => ({
      ...prev,
      [key]: file,
    }));
  }

  async function startCheckout(plan: "weekly" | "monthly") {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Checkout failed.");
        return;
      }

      window.location.href = data.url;
    } catch {
      alert("Checkout failed.");
    }
  }

  async function handleAnalyze() {
if (!isLoaded) {
  return;
}

if (!isSignedIn) {
  window.location.href = "/sign-in";
  return;
}
    if (!canAnalyze && !isPro) {
  window.location.href = "/pricing";
  return;
}

    if (!canAnalyze && !isPro) {
      setShowUpgradeModal(true);
      return;
    }

    const uploadedFiles = timeframes
      .map((timeframe) => [timeframe.key, files[timeframe.key]] as const)
      .filter((entry): entry is readonly [TimeframeKey, File] =>
        Boolean(entry[1])
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
  credentials: "include",
});

      const data = await response.json();

      analysisFinishedRef.current = true;

      if (!response.ok) {
        setLoading(false);

if (response.status === 401) {
  setLoading(false);
  window.location.href = "/sign-in";
  return;
}

        if (data.code === "FREE_LIMIT_REACHED") {
          setCanAnalyze(false);
          setShowUpgradeModal(true);
          return;
        }

        alert(data.error || "Analysis failed.");
        return;
      }

      setAnalysis(data.analysis);

      setTimeout(() => {
        setLoading(false);
        setShowResults(true);

        if (!isPro) {
          setCanAnalyze(false);
          setRemainingHours(24);
          setRemainingMinutes(0);
          setRemainingSeconds(0);
        }

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 1200);
    } catch {
      setLoading(false);
      alert("Analysis failed.");
    }
  }

  function handleNewAnalysis() {
    setShowResults(false);
    setAnalysis(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const uploadedCount = timeframes.filter(
    (timeframe) => files[timeframe.key]
  ).length;

  if (loading) {
    return <LoadingView message={loadingMessages[loadingIndex]} />;
  }

  if (showResults && analysis) {
    return (
     <main className="min-h-screen bg-[#050505] px-4 py-5 text-white md:px-6 md:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Analysis Result
              </p>

              <h1 className="text-3xl font-bold md:text-4xl">
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

  <a
    href="/dashboard"
    className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
  >
    Trading Dashboard
  </a>

  <button
    onClick={handleNewAnalysis}
    className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white"
  >
    New Analysis
  </button>
</div>
</div>

          <section className="mb-5 grid grid-cols-2 gap-3 md:mb-6 md:gap-5 lg:grid-cols-4">
            <TopMetric title="Overall Bias" value={analysis.overallBias} />
            <TopMetric title="Trade Quality" value={analysis.tradeQuality} />
            <TopMetric title="Market State" value={analysis.marketState} />
            <TopMetric title="Trade Duration" value={tradeDuration} />
          </section>

          <section className="mb-6 grid gap-6 lg:grid-cols-2">
            <SimpleCard title="Key Levels" value={analysis.keyLevels} />
            <SimpleCard
              title="Market Structure"
              value={analysis.marketStructure}
            />
          </section>

          <section className="mb-6 grid grid-cols-2 gap-3 md:gap-6">
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

          {analysis.tradeQuality === "No Trade" && analysis.noTradeReason && (
            <section className="mb-6 rounded-3xl border border-red-500/40 bg-red-500/10 p-7">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-red-300">
                No Trade Reason
              </p>

              <p className="text-2xl font-bold leading-tight text-white">
                {analysis.noTradeReason}
              </p>
            </section>
          )}

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
              Final Decision
            </p>

            <p className="text-2xl font-bold leading-tight text-white">
              {analysis.finalDecision}
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <>
      <div
        className="overflow-hidden bg-[#050505] md:hidden"
        style={{ height: mobileCanvasHeight || undefined }}
      >
        <div
          ref={mobileCanvasRef}
          className="w-[820px] bg-[#050505] text-white"
          style={{
            transform: `scale(${mobileScale})`,
            transformOrigin: "top left",
          }}
        >
          <MobileHomeCanvas
            isSignedIn={Boolean(isSignedIn)}
            usageLoaded={usageLoaded}
            isPro={isPro}
            uploadedCount={uploadedCount}
            market={market}
            setMarket={setMarket}
            tradeDuration={tradeDuration}
            setTradeDuration={setTradeDuration}
            instrument={instrument}
            setInstrument={setInstrument}
            timeframes={timeframes}
            files={files}
            handleFileChange={handleFileChange}
            handleAnalyze={handleAnalyze}
            canAnalyze={canAnalyze}
            remainingHours={remainingHours}
            remainingMinutes={remainingMinutes}
            remainingSeconds={remainingSeconds}
          />
        </div>
      </div>

      <main className="hidden min-h-screen bg-[#050505] px-6 py-10 text-white md:block">
        <div className="mx-auto max-w-7xl">
          <DesktopHeader
            isSignedIn={Boolean(isSignedIn)}
            usageLoaded={usageLoaded}
            isPro={isPro}
          />

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
                <h2 className="text-2xl font-bold">Upload Chart Screenshots</h2>
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
              <h2 className="text-2xl font-bold">Planned Trade Duration</h2>
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
              placeholder="Instrument / Pair / Ticker (optional) — e.g. EURUSD, AAPL, GOLD, NAS100"
              className="w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-white"
            />
          </section>

          <section className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-6">
            {timeframes.map((timeframe) => (
              <UploadBox
                key={timeframe.key}
                title={timeframe.title}
                shortTitle={timeframe.shortTitle}
                description={timeframe.description}
                file={files[timeframe.key]}
                onChange={(file) => handleFileChange(timeframe.key, file)}
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

          <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
              How It Works
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <InfoStep
                number="1"
                title="Upload Charts"
                description="Add at least two chart screenshots from different timeframes."
              />
              <InfoStep
                number="2"
                title="Choose Duration"
                description="Select how long you plan to hold the trade so the analysis fits your timeframe."
              />
              <InfoStep
                number="3"
                title="Review the Decision"
                description="Get structured scenarios, key levels, invalidation and a clear final decision."
              />
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
              Why Traders Use It
            </p>
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 text-sm font-semibold text-zinc-200">
              <FeatureItem text="Analysis adapts to the selected trade duration." />
              <FeatureItem text="Higher and lower timeframes are evaluated together." />
              <FeatureItem text="Bullish and bearish scenarios include clear conditions." />
              <FeatureItem text="WAIT and NO TRADE remain valid outcomes." />
            </div>
          </section>

          <footer className="mt-12 border-t border-zinc-900 pt-6 text-center text-sm text-zinc-600">
            <div className="flex flex-wrap justify-center gap-5">
              <a href="/pricing" className="hover:text-white">Pricing</a>
              <a href="/terms" className="hover:text-white">Terms</a>
              <a href="/privacy" className="hover:text-white">Privacy</a>
              <a href="/disclaimer" className="hover:text-white">Risk Disclaimer</a>
              <a href="mailto:support@chartsetup.app" className="hover:text-white">Contact</a>
            </div>
            <p className="mt-4">
              © 2026 ChartSetup Analyzer. Decision-support only. Not financial advice.
            </p>
          </footer>
        </div>
      </main>

      {showUpgradeModal && !isPro && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          onWeekly={() => startCheckout("weekly")}
          onMonthly={() => startCheckout("monthly")}
        />
      )}
    </>
  );
}

function MobileHomeCanvas({
  isSignedIn,
  usageLoaded,
  isPro,
  uploadedCount,
  market,
  setMarket,
  tradeDuration,
  setTradeDuration,
  instrument,
  setInstrument,
  timeframes,
  files,
  handleFileChange,
  handleAnalyze,
  canAnalyze,
  remainingHours,
  remainingMinutes,
  remainingSeconds,
}: {
  isSignedIn: boolean;
  usageLoaded: boolean;
  isPro: boolean;
  uploadedCount: number;
  market: string;
  setMarket: (market: string) => void;
  tradeDuration: string;
  setTradeDuration: (duration: string) => void;
  instrument: string;
  setInstrument: (instrument: string) => void;
  timeframes: readonly {
    key: TimeframeKey;
    title: string;
    shortTitle: string;
    description: string;
  }[];
  files: UploadedFiles;
  handleFileChange: (key: TimeframeKey, file: File | null) => void;
  handleAnalyze: () => void;
  canAnalyze: boolean;
  remainingHours: number;
  remainingMinutes: number;
  remainingSeconds: number;
}) {
  return (
    <main className="min-h-screen bg-[#050505] px-[22px] pb-10 pt-4">
      <header className="mb-5 flex items-stretch gap-4">
        <CanvasNavLink href="/history">History</CanvasNavLink>
        <CanvasNavLink href="/dashboard" wide>
          Trading Dashboard
        </CanvasNavLink>

        {usageLoaded ? (
          isPro ? (
            <div className="flex h-[62px] min-w-[128px] items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 text-sm font-bold text-emerald-300">
              Pro Active
            </div>
          ) : (
            <CanvasNavLink href="/pricing" light>
              Upgrade
            </CanvasNavLink>
          )
        ) : (
          <div className="h-[62px] min-w-[128px] rounded-2xl border border-zinc-800 bg-zinc-950" />
        )}

        {!isSignedIn ? (
          <>
            <CanvasNavLink href="/sign-in">Sign In</CanvasNavLink>
            <CanvasNavLink href="/sign-up">Sign Up</CanvasNavLink>
          </>
        ) : (
          <CanvasNavLink href="/account">Account</CanvasNavLink>
        )}
      </header>

      <section className="mb-5 rounded-[22px] border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-7 shadow-2xl">
        <div className="grid grid-cols-[1fr_300px] items-center gap-7">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
              AI Trading Decision Support
            </p>
            <h1 className="text-[36px] font-bold tracking-tight">
              Chart Setup Analyzer
            </h1>
            <p className="mt-5 max-w-[455px] text-[15px] leading-7 text-zinc-400">
              Upload your chart screenshots by timeframe and choose how long you
              plan to hold the trade. The analysis adapts to your trade duration
              instead of giving a generic market overview.
            </p>
            <p className="mt-5 max-w-[455px] text-[14px] leading-7 text-zinc-500">
              This tool does not provide blind buy or sell signals. It helps
              structure market context, scenarios, invalidation and risk.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Chart Setup Analyzer logo"
              className="max-h-[230px] w-full object-contain"
            />
          </div>
        </div>
      </section>

      <section className="mb-5 rounded-[22px] border border-zinc-800 bg-zinc-950 p-6">
        <div className="mb-5 flex items-start justify-between gap-6">
          <div>
            <h2 className="text-[22px] font-bold">Upload Chart Screenshots</h2>
            <p className="mt-2 text-[14px] text-zinc-400">
              Upload at least 2 timeframes to run the analysis. More uploads
              usually mean a higher-quality result.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-zinc-800 bg-black px-5 py-3 text-sm text-zinc-300">
            {uploadedCount}/6 timeframes uploaded
          </div>
        </div>

        <div className="mb-5 flex items-center gap-2">
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

        <div className="grid grid-cols-6 gap-3">
          {timeframes.map((timeframe) => (
            <MobileCanvasUploadBox
              key={timeframe.key}
              title={timeframe.shortTitle}
              description={timeframe.description}
              file={files[timeframe.key]}
              onChange={(file) => handleFileChange(timeframe.key, file)}
            />
          ))}
        </div>
      </section>

      <section className="mb-5 rounded-[22px] border border-zinc-800 bg-zinc-950 p-6">
        <div className="mb-5">
          <h2 className="text-[22px] font-bold">Planned Trade Duration</h2>
          <p className="mt-2 text-[14px] text-zinc-400">
            This tells the AI whether to prioritize lower timeframes for
            scalping or higher timeframes for swing/position trades.
          </p>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {tradeDurations.map((item) => (
            <button
              key={item.value}
              onClick={() => setTradeDuration(item.value)}
              className={`min-h-[146px] rounded-2xl border px-4 py-5 text-center transition ${
                tradeDuration === item.value
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 bg-black text-zinc-300 hover:border-zinc-500"
              }`}
            >
              <p className="text-base font-bold">{item.label}</p>
              <p
                className={`mt-4 text-sm leading-6 ${
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

      <section className="mb-5 rounded-[22px] border border-zinc-800 bg-zinc-950 p-5">
        <input
          value={instrument}
          onChange={(event) => setInstrument(event.target.value)}
          placeholder="Instrument / Pair / Ticker (optional) — e.g. EURUSD, AAPL, GOLD, NAS100"
          className="w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-[15px] text-white outline-none placeholder:text-zinc-600 focus:border-white"
        />
      </section>

      <button
        onClick={handleAnalyze}
        disabled={(isPro || canAnalyze) && uploadedCount < 2}
        className={`mb-5 w-full rounded-2xl px-6 py-5 text-lg font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
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

      <section className="mb-5 rounded-[22px] border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
          How It Works
        </p>
        <div className="mt-6 grid grid-cols-3 gap-10">
          <CanvasInfoStep
            number="1"
            title="Upload Charts"
            description="Add at least two chart screenshots from different timeframes."
          />
          <CanvasInfoStep
            number="2"
            title="Choose Duration"
            description="Select how long you plan to hold the trade so the analysis fits your timeframe."
          />
          <CanvasInfoStep
            number="3"
            title="Review the Decision"
            description="Get structured scenarios, key levels, invalidation and a clear final decision."
          />
        </div>
      </section>

      <section className="rounded-[22px] border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
          Why Traders Use It
        </p>
        <div className="mt-5 grid grid-cols-2 gap-x-10 gap-y-4 text-sm font-semibold text-zinc-200">
          <FeatureItem text="Analysis adapts to the selected trade duration." />
          <FeatureItem text="Higher and lower timeframes are evaluated together." />
          <FeatureItem text="Bullish and bearish scenarios include clear conditions." />
          <FeatureItem text="WAIT and NO TRADE remain valid outcomes." />
        </div>
      </section>

      <footer className="mt-8 border-t border-zinc-900 pt-5 text-center text-xs text-zinc-600">
        <div className="flex justify-center gap-6">
          <a href="/pricing" className="hover:text-white">Pricing</a>
          <a href="/terms" className="hover:text-white">Terms</a>
          <a href="/privacy" className="hover:text-white">Privacy</a>
          <a href="/disclaimer" className="hover:text-white">Risk Disclaimer</a>
          <a href="mailto:support@chartsetup.app" className="hover:text-white">Contact</a>
        </div>
        <p className="mt-4">
          © 2026 ChartSetup Analyzer. Decision-support only. Not financial advice.
        </p>
      </footer>
    </main>
  );
}

function CanvasNavLink({
  href,
  children,
  light = false,
  wide = false,
}: {
  href: string;
  children: React.ReactNode;
  light?: boolean;
  wide?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex h-[62px] items-center justify-center rounded-2xl px-5 text-center text-sm font-bold transition ${
        wide ? "min-w-[170px]" : "min-w-[112px]"
      } ${
        light
          ? "bg-white text-black hover:bg-zinc-200"
          : "border border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-white hover:text-white"
      }`}
    >
      {children}
    </a>
  );
}

function MobileCanvasUploadBox({
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <label className="flex min-h-[174px] cursor-pointer flex-col justify-between rounded-2xl border-2 border-dashed border-zinc-700 bg-black/40 p-3 transition hover:border-white hover:bg-zinc-900">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />

      <div>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${title} preview`}
            className="mb-3 h-16 w-full rounded-xl border border-zinc-800 object-cover"
          />
        ) : (
          <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl text-2xl text-white">
            ↑
          </div>
        )}

        <h3 className="text-base font-bold">{title}</h3>
        <p className="mt-2 line-clamp-3 text-[12px] leading-5 text-zinc-500">
          {description}
        </p>
      </div>

      <div className="mt-3 text-xs text-zinc-500">
        {file ? "Replace image" : "Click to upload"}
      </div>
    </label>
  );
}

function CanvasInfoStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 text-lg font-bold">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}

function DesktopHeader({
  isSignedIn,
  usageLoaded,
  isPro,
}: {
  isSignedIn: boolean;
  usageLoaded: boolean;
  isPro: boolean;
}) {
  return (
    <header className="mb-6 hidden items-center justify-between md:flex">
      <div className="flex items-center gap-3">
        <a href="/history" className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white">History</a>
        <a href="/dashboard" className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white">Trading Dashboard</a>
      </div>

      <div className="flex items-center gap-3">
        {usageLoaded ? (
          isPro ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-300">Pro Active</div>
          ) : (
            <a href="/pricing" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200">Upgrade</a>
          )
        ) : (
          <div className="h-[46px] w-[110px] rounded-2xl border border-zinc-800 bg-zinc-950" />
        )}

        {!isSignedIn ? (
          <div className="flex gap-3">
            <a href="/sign-in" className="rounded-xl border border-zinc-700 px-5 py-2 text-sm font-bold text-white transition hover:border-white">Sign In</a>
            <a href="/sign-up" className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-zinc-200">Sign Up</a>
          </div>
        ) : (
          <a href="/account" className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-white hover:text-white">Account</a>
        )}
      </div>
    </header>
  );
}

function InfoStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-zinc-800 bg-black p-2 md:rounded-2xl md:p-5">
      <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-zinc-700 text-[9px] font-bold md:h-10 md:w-10 md:rounded-xl md:text-sm">{number}</div>
      <h3 className="mt-2 text-[10px] font-bold leading-tight md:mt-4 md:text-lg">{title}</h3>
      <p className="mt-1 text-[9px] leading-3.5 text-zinc-400 md:mt-2 md:text-sm md:leading-6">{description}</p>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-1.5 md:gap-3">
      <span className="mt-0.5 text-emerald-400">✓</span>
      <span>{text}</span>
    </div>
  );
}

function UpgradeModal({
  onClose,
  onWeekly,
  onMonthly,
}: {
  onClose: () => void;
  onWeekly: () => void;
  onMonthly: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-zinc-800 bg-[#070707] shadow-2xl">
        <div className="border-b border-zinc-800 bg-gradient-to-br from-zinc-950 to-black p-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-zinc-500">
            ChartSetup Pro
          </p>

          <h2 className="text-4xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Analyze without limits.
            </span>
          </h2>

          <p className="mt-4 max-w-xl leading-8 text-zinc-400">
            Upgrade to unlock unlimited AI chart analyses, complete history
            access, and priority processing.
          </p>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          <button
            onClick={onWeekly}
            className="rounded-3xl border border-white bg-white p-6 text-left text-black transition hover:bg-zinc-200"
          >
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-600">
              Weekly
            </p>

            <div className="mt-4 flex items-end gap-2">
              <p className="text-4xl font-bold">€4.99</p>
              <p className="mb-1 text-zinc-600">/ week</p>
            </div>

            <p className="mt-4 leading-7 text-zinc-700">
              Flexible access for traders who want unlimited analysis without a
              monthly commitment.
            </p>

            <div className="mt-6 rounded-2xl bg-black px-4 py-3 text-center font-bold text-white">
              Choose Weekly
            </div>
          </button>

          <button
            onClick={onMonthly}
            className="relative rounded-3xl border border-white bg-white p-6 text-left text-black transition hover:bg-zinc-200"
          >
            <div className="absolute right-5 top-5 rounded-full bg-black px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
              Best Value
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-600">
              Monthly
            </p>

            <div className="mt-4 flex items-end gap-2">
              <p className="text-4xl font-bold">€14.99</p>
              <p className="mb-1 text-zinc-600">/ month</p>
            </div>

            <p className="mt-4 leading-7 text-zinc-700">
              Best for active traders who analyze setups regularly.
            </p>

            <div className="mt-6 rounded-2xl bg-black px-4 py-3 text-center font-bold text-white">
              Choose Monthly
            </div>
          </button>
        </div>

        <div className="border-t border-zinc-800 px-6 py-5">
          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-zinc-800 px-5 py-3 text-sm font-bold text-zinc-400 transition hover:border-zinc-600 hover:text-white"
          >
            Continue with free daily analysis
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingView({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
      <section className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Analysis Running
        </p>

        <h1 className="text-4xl font-bold">Analyzing your setup</h1>

        <p className="mt-4 text-lg text-zinc-400">
          Do not close this page. Your chart context is being processed.
        </p>

        <div className="mt-8 space-y-4">
          {loadingMessages.map((item, index) => {
            const active = item === message;
            const completed = loadingMessages.indexOf(message) > index;

            return (
              <div
                key={item}
                className={`flex items-center gap-4 rounded-2xl border px-5 py-4 transition ${
                  active
                    ? "border-white bg-white text-black"
                    : completed
                    ? "border-zinc-700 bg-black text-zinc-300"
                    : "border-zinc-800 bg-black text-zinc-600"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                    active
                      ? "bg-black text-white"
                      : completed
                      ? "bg-white text-black"
                      : "bg-zinc-900 text-zinc-600"
                  }`}
                >
                  {completed ? "✓" : index + 1}
                </div>

                <p className="font-semibold">{item}</p>
              </div>
            );
          })}
        </div>
      </section>
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const shortTitle = title.replace(" Chart", "");

  return (
    <label className="flex min-h-[145px] min-w-0 cursor-pointer flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-2 transition hover:border-white hover:bg-zinc-900 md:min-h-[260px] md:rounded-3xl md:border-2 md:border-dashed md:border-zinc-700 md:p-5">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />

      <div className="min-w-0">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${title} preview`}
            className="mb-2 h-14 w-full rounded-lg border border-zinc-800 object-cover md:mb-5 md:h-28 md:rounded-2xl"
          />
        ) : (
          <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm font-bold text-black md:mb-5 md:h-12 md:w-12 md:rounded-2xl md:text-2xl">↑</div>
        )}

        <h3 className="truncate text-[11px] font-bold md:hidden">{shortTitle}</h3>
        <h3 className="hidden text-xl font-bold md:block">{title}</h3>
        <p className="mt-3 hidden text-sm leading-6 text-zinc-500 md:block">{description}</p>
      </div>

      <div className="mt-2 truncate rounded-lg bg-black px-1.5 py-2 text-center text-[8px] text-zinc-500 md:mt-6 md:rounded-2xl md:px-4 md:py-3 md:text-left md:text-sm">
        {file ? "Replace image" : "Click to upload"}
      </div>
    </label>
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
      <h2 className="text-xl font-bold md:text-3xl">{title}</h2>

      <div className="mt-4 rounded-2xl bg-black/50 p-3 md:mt-6 md:p-5">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
          Scenario
        </p>

        <p className="whitespace-pre-wrap text-xs leading-5 text-zinc-200 md:text-base md:leading-8">
          {scenario || "No scenario provided."}
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-black/50 p-5">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
          What must happen
        </p>

        <p className="whitespace-pre-wrap text-xs leading-5 text-zinc-200 md:text-base md:leading-8">
          {conditions || "No conditions provided."}
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-black/50 p-3 md:mt-6 md:p-5">
        <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
  <p className="text-sm font-bold md:text-base">
    Probability Score
  </p>

  <p className="text-2xl font-bold md:text-2xl">
    {safeScore}/100
  </p>
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