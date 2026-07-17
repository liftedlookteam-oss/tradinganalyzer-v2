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

type MobileResultsProps = {
  analysis: Analysis;
  tradeDuration: string;
  onNewAnalysis: () => void;
};

export default function MobileResults({
  analysis,
  tradeDuration,
  onNewAnalysis,
}: MobileResultsProps) {
  return (
    <main className="min-h-screen bg-[#050505] px-3 py-4 text-white">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
            Analysis Result
          </p>

          <h1 className="text-3xl font-bold leading-tight">
            Trade Decision Dashboard
          </h1>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <a
            href="/history"
            className="flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-center text-xs font-bold text-zinc-200"
          >
            History
          </a>

          <a
            href="/dashboard"
            className="flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-center text-xs font-bold text-zinc-200"
          >
            Dashboard
          </a>

          <button
            onClick={onNewAnalysis}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-xs font-bold text-zinc-200"
          >
            New Analysis
          </button>
        </div>

        <section className="mb-4 grid grid-cols-2 gap-3">
          <TopMetric title="Overall Bias" value={analysis.overallBias} />
          <TopMetric title="Trade Quality" value={analysis.tradeQuality} />
          <TopMetric title="Market State" value={analysis.marketState} />
          <TopMetric title="Trade Duration" value={tradeDuration} />
        </section>

        <section className="mb-4">
          <SimpleCard
            title="Key Levels"
            value={analysis.keyLevels}
          />
        </section>

        <section className="mb-4">
          <SimpleCard
            title="Market Structure"
            value={analysis.marketStructure}
          />
        </section>

        <section className="mb-4">
          <ScenarioPanel
            type="bullish"
            title="Bullish Scenario"
            scenario={analysis.bullishScenario}
            conditions={analysis.bullishConditions}
            score={analysis.bullishScore}
          />
        </section>

        <section className="mb-4">
          <ScenarioPanel
            type="bearish"
            title="Bearish Scenario"
            scenario={analysis.bearishScenario}
            conditions={analysis.bearishConditions}
            score={analysis.bearishScore}
          />
        </section>

        <section className="mb-4 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
            Most Important Thing Right Now
          </p>

          <p className="text-lg font-bold leading-7 text-white">
            {analysis.mostImportantThing}
          </p>
        </section>

        {analysis.tradeQuality === "No Trade" &&
          analysis.noTradeReason && (
            <section className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-red-300">
                No Trade Reason
              </p>

              <p className="text-lg font-bold leading-7 text-white">
                {analysis.noTradeReason}
              </p>
            </section>
          )}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Final Decision
          </p>

          <p className="text-lg font-bold leading-7 text-white">
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
    <div className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">
        {title}
      </p>

      <p className="mt-2 break-words text-lg font-bold">
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <h2 className="text-xl font-bold">
        {title}
      </h2>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
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
  const safeScore = Math.max(
    0,
    Math.min(100, Number(score) || 0)
  );

  const isBullish = type === "bullish";

  return (
    <div
      className={`rounded-2xl border p-4 ${
        isBullish
          ? "border-green-600/70 bg-green-900/35"
          : "border-red-600/70 bg-red-900/35"
      }`}
    >
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <div className="mt-4 rounded-xl bg-black/50 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
          Scenario
        </p>

        <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-200">
          {scenario || "No scenario provided."}
        </p>
      </div>

      <div className="mt-3 rounded-xl bg-black/50 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
          What must happen
        </p>

        <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-200">
          {conditions || "No conditions provided."}
        </p>
      </div>

      <div className="mt-3 rounded-xl bg-black/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold">
            Probability Score
          </p>

          <p className="text-xl font-bold">
            {safeScore}/100
          </p>
        </div>

        <div className="relative h-3 rounded-full bg-zinc-800">
          <div
            className="absolute left-0 top-0 h-3 rounded-full bg-white"
            style={{
              width: `${safeScore}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}