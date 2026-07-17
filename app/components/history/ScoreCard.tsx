"use client";

type ScoreCardProps = {
  type: "bullish" | "bearish";
  score: number;
};

export default function ScoreCard({
  type,
  score,
}: ScoreCardProps) {
  const safeScore = Math.max(
    0,
    Math.min(100, Number(score) || 0)
  );

  const isBullish = type === "bullish";

  return (
    <div
      className={`rounded-3xl border p-5 ${
        isBullish
          ? "border-green-600/60 bg-green-900/20"
          : "border-red-600/60 bg-red-900/20"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-lg font-bold">
          {isBullish ? "Bullish" : "Bearish"} Score
        </p>

        <p className="text-2xl font-bold">
          {safeScore}/100
        </p>
      </div>

      <div className="relative h-4 rounded-full bg-zinc-800">
        <div
          className="absolute left-0 top-0 h-4 rounded-full bg-white"
          style={{
            width: `${safeScore}%`,
          }}
        />
      </div>
    </div>
  );
}