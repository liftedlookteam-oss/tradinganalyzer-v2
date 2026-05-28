export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <p className="mt-4 text-zinc-400">
          Last updated: May 2026
        </p>

        <section className="mt-10 space-y-8 leading-8 text-zinc-300">
          <p>
            This Privacy Policy explains how
            ChartSetup Analyzer collects,
            uses, and protects user data.
          </p>

          <h2 className="text-2xl font-bold text-white">
            1. Information We Collect
          </h2>

          <p>
            We may collect account
            information, uploaded chart
            screenshots, payment-related
            information, usage analytics,
            and technical device data
            necessary to operate the
            platform.
          </p>

          <h2 className="text-2xl font-bold text-white">
            2. Uploaded Charts
          </h2>

          <p>
            Uploaded chart screenshots are
            used only for generating AI
            analysis and improving the user
            experience. We do not publicly
            share uploaded trading charts.
          </p>

          <h2 className="text-2xl font-bold text-white">
            3. Payments
          </h2>

          <p>
            Payments and subscription
            processing are handled securely
            through Stripe. We do not store
            full payment card information on
            our servers.
          </p>

          <h2 className="text-2xl font-bold text-white">
            4. Authentication
          </h2>

          <p>
            Account authentication and sign
            in services are handled through
            Clerk.
          </p>

          <h2 className="text-2xl font-bold text-white">
            5. Analytics
          </h2>

          <p>
            We may collect anonymous usage
            analytics to improve product
            quality, reliability, and user
            experience.
          </p>

          <h2 className="text-2xl font-bold text-white">
            6. Data Security
          </h2>

          <p>
            We take reasonable measures to
            protect user information, but no
            online service can guarantee
            absolute security.
          </p>

          <h2 className="text-2xl font-bold text-white">
            7. User Rights
          </h2>

          <p>
            Users may request account
            deletion or contact support with
            privacy-related questions.
          </p>

          <h2 className="text-2xl font-bold text-white">
            8. Contact
          </h2>

          <p>
            For privacy questions, contact
            support@chartsetup.app.
          </p>
        </section>
      </div>
    </main>
  );
}