export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-sm font-bold text-zinc-400 hover:text-white">
          ← Back to Analyzer
        </a>

        <h1 className="mt-8 text-5xl font-bold">Terms of Service</h1>

        <p className="mt-4 text-zinc-400">Last updated: May 2026</p>

        <section className="mt-10 space-y-8 leading-8 text-zinc-300">
          <p>
            By using ChartSetup Analyzer, you agree to these Terms of Service.
            If you do not agree, you should not use the platform.
          </p>

          <h2 className="text-2xl font-bold text-white">1. Service Description</h2>
          <p>
            ChartSetup Analyzer provides AI-powered trading analysis based on
            chart screenshots uploaded by users. The platform is designed for
            education, market structure review, and decision support.
          </p>

          <h2 className="text-2xl font-bold text-white">2. No Financial Advice</h2>
          <p>
            ChartSetup Analyzer does not provide financial advice, investment
            advice, trading signals, or guaranteed outcomes. All analysis is
            informational only. You are fully responsible for your own trading
            decisions and risk management.
          </p>

          <h2 className="text-2xl font-bold text-white">3. User Responsibility</h2>
          <p>
            Trading involves risk. You should not rely solely on AI-generated
            analysis. You are responsible for verifying all market information,
            managing risk, and deciding whether any trade is suitable for you.
          </p>

          <h2 className="text-2xl font-bold text-white">4. Subscriptions</h2>
          <p>
            Paid subscriptions provide access to premium features such as
            unlimited analyses. Subscription billing, cancellations, and payment
            management are handled through the billing portal.
          </p>

          <h2 className="text-2xl font-bold text-white">5. Acceptable Use</h2>
          <p>
            You may not misuse the platform, attempt to bypass usage limits,
            attack the service, copy the product, or use it for unlawful
            purposes.
          </p>

          <h2 className="text-2xl font-bold text-white">6. Availability</h2>
          <p>
            We aim to keep the platform available, but we do not guarantee
            uninterrupted service. Features may change, improve, or be removed
            over time.
          </p>

          <h2 className="text-2xl font-bold text-white">7. Limitation of Liability</h2>
          <p>
            ChartSetup Analyzer is not liable for trading losses, financial
            decisions, missed opportunities, data errors, service interruptions,
            or reliance on AI-generated output.
          </p>

          <h2 className="text-2xl font-bold text-white">8. Contact</h2>
          <p>
            For questions about these terms, contact support@chartsetup.app.
          </p>
        </section>
      </div>
    </main>
  );
}