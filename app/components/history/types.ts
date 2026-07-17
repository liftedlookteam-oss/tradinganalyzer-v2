export type HistoryItem = {
  id: string;
  market: string;
  instrument?: string | null;
  trade_duration: string;
  analysis: {
    overallBias: string;
    tradeQuality: string;
    marketState?: string;
    mostImportantThing: string;
    bullishScore: number;
    bearishScore: number;
    finalDecision: string;
  };
  created_at: string;
};