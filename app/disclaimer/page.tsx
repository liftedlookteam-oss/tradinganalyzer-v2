export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <a
          href="/"
          className="text-sm font-bold text-zinc-400 hover:text-white"
        >
          ← Back to Analyzer
        </a>

        <h1 className="mt-8 text-5xl font-bold">
          Risk Disclaimer
        </h1>

        <p className="mt-4 text-zinc-400">
          Last updated: May 2026
        </p>

        <section className="mt-10 space-y-8 leading-8 text-zinc-300">
          <p>
            Trading financial markets
            involves substantial risk and
            may not be suitable for all
            users.
          </p>

          <h2 className="text-2xl font-bold text-white">
            1. No Guaranteed Results
          </h2>

          <p>
            ChartSetup Analyzer does not
            guarantee profits, successful
            trades, or financial outcomes.
            AI-generated analysis may be
            incomplete, inaccurate, delayed,
            or unsuitable for your specific
            situation.
          </p>

          <h2 className="text-2xl font-bold text-white">
            2. Educational & Decision Support
          </h2>

          <p>
            The platform is intended for
            educational purposes and trading
            decision support only. It should
            not be treated as financial or
            investment advice.
          </p>

          <h2 className="text-2xl font-bold text-white">
            3. User Responsibility
          </h2>

          <p>
            You are fully responsible for
            your own trades, risk
            management, capital allocation,
            and trading decisions.
          </p>

          <h2 className="text-2xl font-bold text-white">
            4. Market Risk
          </h2>

          <p>
            Financial markets are volatile.
            Past performance, market
            structure, or AI analysis do not
            guarantee future outcomes.
          </p>

          <h2 className="text-2xl font-bold text-white">
            5. Technical Limitations
          </h2>

          <p>
            AI analysis depends on uploaded
            screenshots and available chart
            information. Incorrect,
            incomplete, or low-quality chart
            uploads may affect analysis
            quality.
          </p>

          <h2 className="text-2xl font-bold text-white">
            6. Limitation of Liability
          </h2>

          <p>
            ChartSetup Analyzer is not
            responsible for trading losses,
            missed opportunities, account
            losses, or financial damages
            related to the use of the
            platform.
          </p>

          <h2 className="text-2xl font-bold text-white">
            7. Contact
          </h2>

          <p>
            For questions regarding this
            disclaimer, contact
            support@chartsetup.app.
          </p>
        </section>
      </div>
    </main>
  );
}