"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
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

  const [unlimitedAnalysis, setUnlimitedAnalysis] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [usageError, setUsageError] = useState(false);
  const [usageLoaded, setUsageLoaded] = useState(false);
  const [canAnalyze, setCanAnalyze] = useState(false);

  const [availableAt, setAvailableAt] = useState(0);
  const [now, setNow] = useState(0);
  const remaining = Math.max(0, Math.ceil((availableAt - now) / 1000));
  const remainingHours = Math.floor(remaining / 3600);
  const remainingMinutes = Math.floor(remaining / 60) % 60;
  const remainingSeconds = remaining % 60;

  const analysisFinishedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setUsageLoaded(true);
      return;
    }

    async function checkUsage() {
      setUsageLoaded(false);
      setUsageError(false);
      try {
        const response = await fetch("/api/usage");

        if (!response.ok) throw new Error("Usage request failed");

        const data = await response.json();

        setIsPro(Boolean(data.isPro));
        setUnlimitedAnalysis(Boolean(data.unlimitedAnalysis));
        setCanAnalyze(Boolean(data.canAnalyze));

        setNow(Date.now());
        setAvailableAt(data.availableAt || 0);
      } catch {
        setUsageError(true);
      } finally {
        setUsageLoaded(true);
      }
    }

    checkUsage();
  }, [isLoaded, isSignedIn]);

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
    if (!availableAt) return;
    const timer = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= availableAt) {
        setCanAnalyze(true);
        setAvailableAt(0);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [availableAt]);

  function handleFileChange(key: TimeframeKey, file: File | null) {
    setFiles((previous) => ({ ...previous, [key]: file }));
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
    if (loading) return;
if (!isLoaded) {
  return;
}

if (!isSignedIn) {
  window.location.href = "/sign-in";
  return;
}
    if (!canAnalyze && !isPro) {
      setShowUpgradeModal(true);
      return;
    }

    const uploadedFiles = timeframes.flatMap(({ key }) => {
      const file = files[key];
      return file ? [{ key, file }] : [];
    });

    if (uploadedFiles.length < 2) {
      alert("Upload at least 2 timeframe charts before analyzing.");
      return;
    }

    if (timeframes.reduce((total, { key }) => total + (files[key]?.size ?? 0), 0) > 4_000_000) {
      alert("The selected images must be 4 MB or less in total.");
      return;
    }

    if (!unlimitedAnalysis && !isPro) {
      const startedAt = Date.now();
      setNow(startedAt);
      setAvailableAt(startedAt + 86_400_000);
      setCanAnalyze(false);
    }
    setLoading(true);
    setLoadingIndex(0);
    setAnalysis(null);

    const formData = new FormData();

    formData.append("market", market);
    formData.append("instrument", instrument.trim());
    formData.append("tradeDuration", tradeDuration);

    for (const { key, file } of uploadedFiles) {
      formData.append(key, file);
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
          setAvailableAt(data.availableAt || 0);
          setShowUpgradeModal(true);
          return;
        }

        if (!unlimitedAnalysis && !isPro) {
          setAvailableAt(0);
          setCanAnalyze(true);
        }
        alert(data.error || "Analysis failed.");
        return;
      }

      setAvailableAt(data.availableAt || 0);
      setAnalysis(data.analysis);

      setTimeout(() => {
        setLoading(false);
        setShowResults(true);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 1200);
    } catch {
      setLoading(false);
      if (!unlimitedAnalysis && !isPro) {
        setAvailableAt(0);
        setCanAnalyze(true);
      }
      alert("Analysis failed. Check History before retrying.");
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

  const uploadedCount = timeframes.filter(({ key }) => files[key]).length;
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
  usageError,
  loading,
  loadingMessage: loadingMessages[loadingIndex],
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