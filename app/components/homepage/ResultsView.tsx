"use client";

import DesktopResults from "./DesktopResults";
import MobileResults from "./MobileResults";

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

type ResultsViewProps = {
  analysis: Analysis;
  tradeDuration: string;
  onNewAnalysis: () => void;
};

export default function ResultsView({
  analysis,
  tradeDuration,
  onNewAnalysis,
}: ResultsViewProps) {
  const sharedProps = {
    analysis,
    tradeDuration,
    onNewAnalysis,
  };

  return (
    <>
      <div className="hidden md:block">
        <DesktopResults {...sharedProps} />
      </div>

      <div className="md:hidden">
        <MobileResults {...sharedProps} />
      </div>
    </>
  );
}