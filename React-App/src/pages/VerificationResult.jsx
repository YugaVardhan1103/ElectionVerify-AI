function VerificationResult() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">
          Verification Results
        </h1>

        <p className="mt-2 text-text-secondary">
          Review the evidence and analysis of your submitted claim.
        </p>

        {/* Verdict Card */}
        <div className="card mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
            <p className="text-sm font-semibold text-text-secondary">
                VERIFICATION VERDICT
            </p>

            <h2 className="mt-2 text-2xl font-bold text-warning">
                Partially Supported
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
                The claim contains some accurate information,
                but certain details require clarification.
            </p>
            </div>

            <span className="w-fit rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
            Needs Context
            </span>

        </div>
        </div>

        {/* Confidence Indicator */}
        <div className="card mt-6">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
            Evidence Confidence
            </h2>

            <span className="text-xl font-bold text-brand-600">
            78%
            </span>
        </div>

        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-[78%] rounded-full bg-brand-600"></div>
        </div>

        <p className="mt-3 text-sm text-text-secondary">
            The assessment has moderate confidence based on the
            available supporting and contradicting evidence.
        </p>
        </div>

        {/* Claim Summary */}
        <div className="card mt-6">
        <h2 className="text-lg font-bold">
            Claim Summary
        </h2>

        <p className="mt-4 text-sm leading-7 text-text-secondary">
            The election voting date has been changed, and voters
            are being asked to follow a newly announced schedule.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            Election Information
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            Voting Schedule
            </span>
        </div>
        </div>

        {/* Supporting Evidence */}
        <div className="card mt-6">
        <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success"></div>
            <h2 className="text-lg font-bold">
            Supporting Evidence
            </h2>
        </div>

        <div className="mt-5 rounded-lg border border-border p-4">
            <h3 className="font-semibold">
            Official Election Announcement
            </h3>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
            An official announcement provides information about
            the election schedule and relevant voting dates.
            </p>

            <p className="mt-3 text-xs font-medium text-success">
            Evidence supports part of the claim.
            </p>
        </div>
        </div>

        {/* Contradicting Evidence */}
        <div className="card mt-6">
        <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-danger"></div>
            <h2 className="text-lg font-bold">
            Contradicting Evidence
            </h2>
        </div>

        <div className="mt-5 rounded-lg border border-border p-4">
            <h3 className="font-semibold">
            Previous Election Schedule
            </h3>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
            Previously published election information indicates
            that some details of the circulating claim may be
            inconsistent with the available schedule.
            </p>

            <p className="mt-3 text-xs font-medium text-danger">
            Evidence challenges part of the claim.
            </p>
        </div>
        </div>

        {/* AI Explanation */}
        <div className="card mt-6">
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">
            AI Analysis & Explanation
            </h2>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
            AI Assisted
            </span>
        </div>

        <p className="mt-4 text-sm leading-7 text-text-secondary">
            The available information provides partial support for
            the submitted claim. However, certain details appear
            inconsistent with previously published information.
            Further examination of official sources is necessary
            before reaching a definitive conclusion.
        </p>

        <div className="mt-5 rounded-lg bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">
            Important Notice
            </p>

            <p className="mt-2 text-sm leading-6 text-amber-700">
            AI-generated analysis may contain limitations.
            Always review the original sources and consider
            human expert verification.
            </p>
        </div>
        </div>

        {/* Source References */}
        <div className="card mt-6">
        <h2 className="text-lg font-bold">
            Source References
        </h2>

        <p className="mt-2 text-sm text-text-secondary">
            Review the original sources used during the verification process.
        </p>

        <div className="mt-5 space-y-4">
            <div className="rounded-lg border border-border p-4">
            <h3 className="font-semibold">
                Official Election Information
            </h3>

            <p className="mt-2 text-sm text-text-secondary">
                Official election-related announcements and information.
            </p>

            <p className="mt-2 text-xs text-text-secondary">
                Source type: Official Government Source
            </p>
            </div>

            <div className="rounded-lg border border-border p-4">
            <h3 className="font-semibold">
                Published Election Report
            </h3>

            <p className="mt-2 text-sm text-text-secondary">
                Additional published information relevant to the claim.
            </p>

            <p className="mt-2 text-xs text-text-secondary">
                Source type: News Publication
            </p>
            </div>
        </div>
        </div>

        {/* Verification Details */}
        <div className="card mt-6">
        <h2 className="text-lg font-bold">
            Verification Details
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
            <p className="text-sm text-text-secondary">
                Verification Method
            </p>
            <p className="mt-1 font-medium">
                AI-Assisted Analysis
            </p>
            </div>

            <div>
            <p className="text-sm text-text-secondary">
                Review Status
            </p>
            <p className="mt-1 font-medium">
                Awaiting Human Review
            </p>
            </div>

            <div>
            <p className="text-sm text-text-secondary">
                Evidence Sources
            </p>
            <p className="mt-1 font-medium">
                2 Sources
            </p>
            </div>

            <div>
            <p className="text-sm text-text-secondary">
                Verification Date
            </p>
            <p className="mt-1 font-medium">
                Sample Record
            </p>
            </div>

        </div>
        </div>

      </div>
    </main>
  );
}

export default VerificationResult;