"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import LoadingView from "./components/homepage/LoadingView";
import UpgradeModal from "./components/homepage/UpgradeModal";
import ResultsView from "./components/homepage/ResultsView";
import DesktopHomepage from "./components/homepage/DesktopHomepage";
import MobileHomepage from "./components/homepage/MobileHomepage";

type TimeframeKey =
  | "weekly"
  | "daily"
  | "h4"
  | "h2"
  | "h1"
  | "m15"
  | "m5";

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

  const uploadedCount = Object.values(files).filter(Boolean).length;
  const canClickAnalyze = uploadedCount >= 2 && !loading;

  if (loading) {
    return <LoadingView message={loadingMessages[loadingIndex]} />;
  }

  if (showResults && analysis) {
  return (
    <ResultsView
      analysis={analysis}
      tradeDuration={tradeDuration}
      onNewAnalysis={handleNewAnalysis}
    />
  );
}

  const sharedProps = {
  isSignedIn: Boolean(isSignedIn),
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
};

return (
  <>
    <div className="hidden md:block">
      <DesktopHomepage {...sharedProps} />
    </div>

    <div className="md:hidden">
      <MobileHomepage {...sharedProps} />
    </div>

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