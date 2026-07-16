"use client";

const loadingMessages = [
  "Reading uploaded charts...",
  "Checking timeframe alignment...",
  "Detecting market state...",
  "Evaluating liquidity context...",
  "Building bullish and bearish scenarios...",
  "Preparing final decision...",
];

export default function LoadingView({
  message,
}: {
  message: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
      <section className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Analysis Running
        </p>

        <h1 className="text-4xl font-bold">
          Analyzing your setup
        </h1>

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

                <p className="font-semibold">
                  {item}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}