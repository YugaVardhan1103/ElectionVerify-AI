
import { Link } from "react-router-dom";

function Home() {
  return (
    <>
    <main>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-24">

        <div className="max-w-3xl">

          <p className="mb-5 font-semibold tracking-wide text-brand-600">
            AI-POWERED ELECTION INFORMATION VERIFICATION
          </p>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Don't just believe it.
            <span className="block text-brand-600">
              Verify it.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">
            Investigate election-related claims with AI-assisted
            analysis, reliable evidence, and transparent verification
            reports. Make informed decisions based on facts.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <Link to="/signup" className="btn-primary">
              Get Started
            </Link>

            <a
              href="#how-it-works"
              className="btn-secondary"
            >
              How It Works
            </a>

          </div>

          <p className="mt-5 text-sm text-text-secondary">
            Evidence-driven information. Transparent analysis.
            Human oversight.
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
            <p className="font-semibold text-brand-600">
              SIMPLE AND TRANSPARENT
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              How ElectionVerify AI Works
            </h2>

            <p className="mt-4 text-text-secondary">
              From a questionable claim to an evidence-based
              understanding in three simple steps.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">

            <div className="card">
              <span className="text-3xl font-bold text-brand-600">
                01
              </span>

              <h3 className="mt-5 text-xl font-semibold">
                Submit a Claim
              </h3>

              <p className="mt-3 text-text-secondary">
                Enter an election-related statement or share a
                URL containing information you want to investigate.
              </p>
            </div>

            <div className="card">
              <span className="text-3xl font-bold text-brand-600">
                02
              </span>

              <h3 className="mt-5 text-xl font-semibold">
                Analyse the Evidence
              </h3>

              <p className="mt-3 text-text-secondary">
                AI-assisted analysis examines relevant sources
                and identifies supporting or contradicting evidence.
              </p>
            </div>

            <div className="card">
              <span className="text-3xl font-bold text-brand-600">
                03
              </span>

              <h3 className="mt-5 text-xl font-semibold">
                Review the Report
              </h3>

              <p className="mt-3 text-text-secondary">
                Explore the findings, source references,
                evidence and limitations of the analysis.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* Platform Features Section */}
      <section className="bg-background px-6 py-20">
        <div className="mx-auto max-w-7xl">

          <div className="text-center">
            <p className="font-semibold text-brand-600">
              PLATFORM CAPABILITIES
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Everything You Need to Investigate Claims
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
              Explore tools designed to help users examine
              election-related information with greater clarity.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            <div className="card">
              <h3 className="text-lg font-semibold">
                AI-Assisted Claim Analysis
              </h3>
              <p className="mt-3 text-text-secondary">
                Extract and analyse important information from
                submitted election-related claims.
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold">
                Evidence-Based Verification
              </h3>
              <p className="mt-3 text-text-secondary">
                Examine relevant evidence that supports or
                contradicts a submitted claim.
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold">
                Transparent Reports
              </h3>
              <p className="mt-3 text-text-secondary">
                Understand verification findings through
                structured and explainable reports.
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold">
                Source References
              </h3>
              <p className="mt-3 text-text-secondary">
                Explore source links and supporting information
                behind verification results.
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold">
                Verification History
              </h3>
              <p className="mt-3 text-text-secondary">
                Keep track of previously submitted claims
                and their verification reports.
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold">
                Human Review
              </h3>
              <p className="mt-3 text-text-secondary">
                Support feedback and human oversight to
                improve verification quality.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* Trust and Transparency Section */}
      <section className="border-t border-border bg-surface px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">

          <div>
            <p className="font-semibold text-brand-600">
              BUILT ON TRANSPARENCY
            </p>

            <h2 className="mt-3 text-3xl font-bold leading-tight">
              Verification Should Be About Evidence,
              Not Just AI Opinions.
            </h2>

            <p className="mt-5 leading-relaxed text-text-secondary">
              ElectionVerify AI aims to make election-related
              information easier to investigate. Every verification
              should be supported by relevant evidence and clear
              explanations.
            </p>

            <p className="mt-4 leading-relaxed text-text-secondary">
              AI-assisted analysis is not a substitute for
              independent judgment. The platform is designed
              around transparency, responsible AI usage,
              and human oversight.
            </p>
          </div>

          <div className="space-y-5">

            <div className="card">
              <h3 className="font-semibold text-lg">
                Evidence Comes First
              </h3>
              <p className="mt-2 text-text-secondary">
                Verification conclusions should be grounded
                in relevant and traceable sources.
              </p>
            </div>

            <div className="card">
              <h3 className="font-semibold text-lg">
                No Unsupported Conclusions
              </h3>
              <p className="mt-2 text-text-secondary">
                When available evidence is insufficient,
                the platform should clearly communicate uncertainty.
              </p>
            </div>

            <div className="card">
              <h3 className="font-semibold text-lg">
                Human Oversight Matters
              </h3>
              <p className="mt-2 text-text-secondary">
                Human review and feedback should complement
                automated analysis.
              </p>
            </div>

          </div>

        </div>
      </section>

    </main>

    
    {/* Footer */}
    <footer className="bg-slate-950 px-6 py-12 text-slate-300">
      <div className="mx-auto max-w-7xl">

        <div className="grid gap-10 md:grid-cols-3">

          <div>
            <h2 className="text-xl font-bold text-white">
              ElectionVerify AI
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              An AI-assisted platform designed to help
              people investigate election-related claims
              through evidence and transparent analysis.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Quick Links
            </h3>

            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href="/" className="hover:text-white">
                  Home
                </a>
              </li>

              <li>
                <a href="#how-it-works" className="hover:text-white">
                  How It Works
                </a>
              </li>

              <li>
                <a href="/login" className="hover:text-white">
                  Login
                </a>
              </li>

              <li>
                <a href="/signup" className="hover:text-white">
                  Sign Up
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Our Principles
            </h3>

            <ul className="mt-4 space-y-3 text-sm">
              <li>Evidence-based analysis</li>
              <li>Transparency</li>
              <li>Responsible AI</li>
              <li>Human oversight</li>
            </ul>
          </div>

        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-sm">
          © {new Date().getFullYear()} ElectionVerify AI.
          All rights reserved.
        </div>

      </div>
    </footer>


    </>
  );
}

export default Home;
