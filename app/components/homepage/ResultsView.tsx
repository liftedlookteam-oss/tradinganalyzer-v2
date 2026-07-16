"use client";

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
              onClick={onNewAnalysis}
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

function TopMetric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold">
        {value || "N/A"}
      </p>
    </div>
  );
}

function SimpleCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

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
      <h2 className="text-xl font-bold md:text-3xl">
        {title}
      </h2>

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

          <p className="text-2xl font-bold">
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