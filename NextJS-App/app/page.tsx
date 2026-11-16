import Link from "next/link";

export default function Home() {
  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold tracking-wide text-brand-600 dark:text-brand-400">
              AI-POWERED ELECTION INFORMATION VERIFICATION
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl text-text-primary">
              Don&apos;t just believe it.
              <span className="block text-brand-600 dark:text-brand-400">
                Verify it.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">
              Investigate election-related claims with evidence-grounded analysis,
              transparent verification reports, and human oversight. Make informed
              decisions based on facts.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup" className="btn-primary">
                Get Started
              </Link>
              <a href="#how-it-works" className="btn-secondary">
                How It Works
              </a>
            </div>

            <p className="mt-5 text-sm text-text-secondary">
              Evidence-driven information &bull; Transparent analysis &bull; Human oversight
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="border-t border-border bg-surface px-6 py-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                SIMPLE AND TRANSPARENT
              </p>
              <h2 className="mt-2 text-3xl font-bold text-text-primary">
                How ElectionVerify AI Works
              </h2>
              <p className="mt-3 text-text-secondary">
                From a circulating claim to an evidence-grounded understanding in three clear steps.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              <div className="card">
                <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                  01
                </span>
                <h3 className="mt-4 text-xl font-semibold text-text-primary">
                  Submit a Claim
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Enter an election-related statement or share a URL containing claims you wish to investigate.
                </p>
              </div>

              <div className="card">
                <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                  02
                </span>
                <h3 className="mt-4 text-xl font-semibold text-text-primary">
                  Analyse the Evidence
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Our pipeline gathers official gazettes, legal rulings, and news reports, comparing statements against authentic evidence.
                </p>
              </div>

              <div className="card">
                <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                  03
                </span>
                <h3 className="mt-4 text-xl font-semibold text-text-primary">
                  Review the Report
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Explore explainable findings across our 5 canonical verdicts, reviewing supporting sources, caveats, and human verification notes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Transparency Section */}
        <section className="bg-background px-6 py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                BUILT ON TRANSPARENCY
              </p>
              <h2 className="mt-2 text-3xl font-bold leading-tight text-text-primary">
                Verification Should Be About Evidence, Not Just AI Opinions.
              </h2>
              <p className="mt-4 leading-relaxed text-text-secondary">
                ElectionVerify AI is designed to make public interest claims verifiable through evidence. Every verification outcome is tied directly to source documents and statutory notifications.
              </p>
              <p className="mt-4 leading-relaxed text-text-secondary">
                When evidence is inconclusive, we explicitly communicate uncertainty under the &quot;Insufficient Evidence&quot; verdict, directing claims to certified human analysts.
              </p>
            </div>

            <div className="space-y-4">
              <div className="card">
                <h3 className="font-semibold text-text-primary">
                  Evidence Comes First
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Findings are strictly grounded in verifiable primary sources.
                </p>
              </div>

              <div className="card">
                <h3 className="font-semibold text-text-primary">
                  No Fabricated Conclusions
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  We never generate fake sources, artificial citations, or unsupported confidence percentages.
                </p>
              </div>

              <div className="card">
                <h3 className="font-semibold text-text-primary">
                  Human Oversight
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Automated reasoning acts as an assistive tool, subject to human review and community correction.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface px-6 py-12 text-text-secondary">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                ElectionVerify AI
              </h2>
              <p className="mt-3 text-xs leading-relaxed">
                An evidence-driven civic platform empowering voters to investigate election claims with transparency, verified citations, and human accountability.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Quick Navigation
              </h3>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <Link href="/" className="hover:text-brand-600">Home</Link>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-brand-600">How It Works</a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-brand-600">Login</Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-brand-600">Sign Up</Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Core Principles
              </h3>
              <ul className="mt-3 space-y-2 text-xs">
                <li>&bull; Evidence-based verification</li>
                <li>&bull; Complete transparency</li>
                <li>&bull; Ethical, non-hallucinatory AI</li>
                <li>&bull; Human-in-the-loop oversight</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6 text-center text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} ElectionVerify AI. Next.js App Router client.
          </div>
        </div>
      </footer>
    </>
  );
}
