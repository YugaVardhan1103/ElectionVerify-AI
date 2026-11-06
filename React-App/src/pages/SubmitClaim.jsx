function SubmitClaim() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">
          Submit a Claim
        </h1>

        <p className="mt-2 text-text-secondary">
          Submit an election-related claim for verification.
        </p>

        <div className="card mt-8">
            <form className="space-y-6">

                {/* Claim Statement */}
                <div>
                <label
                    htmlFor="claim"
                    className="mb-2 block text-sm font-semibold"
                >
                    Claim Statement
                </label>

                <textarea
                    id="claim"
                    rows="5"
                    placeholder="Enter the election-related claim you want to verify..."
                    className="w-full resize-y rounded-lg border border-border px-4 py-3 outline-none focus:border-brand-600"
                />

                <p className="mt-2 text-xs text-text-secondary">
                    Clearly describe the statement you want to investigate.
                </p>
                </div>

                {/* Source URL */}
                <div>
                <label
                    htmlFor="sourceUrl"
                    className="mb-2 block text-sm font-semibold"
                >
                    Source URL <span className="font-normal text-text-secondary">(Optional)</span>
                </label>

                <input
                    id="sourceUrl"
                    type="url"
                    placeholder="https://example.com/article"
                    className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-brand-600"
                />

                <p className="mt-2 text-xs text-text-secondary">
                    Provide the original article, website, or social media link where you found this claim.
                </p>
                </div>

                {/* Language */}
                    <div>
                    <label
                        htmlFor="language"
                        className="mb-2 block text-sm font-semibold"
                    >
                        Claim Language
                    </label>

                    <select
                        id="language"
                        className="w-full rounded-lg border border-border bg-white px-4 py-3 outline-none focus:border-brand-600"
                        defaultValue="English"
                    >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Kannada">Kannada</option>
                        <option value="Malayalam">Malayalam</option>
                        <option value="Other">Other</option>
                    </select>

                    <p className="mt-2 text-xs text-text-secondary">
                        Select the language in which the original claim is written.
                    </p>
                    </div>

                    {/* Additional Context */}
                        <div>
                        <label
                            htmlFor="context"
                            className="mb-2 block text-sm font-semibold"
                        >
                            Additional Context{" "}
                            <span className="font-normal text-text-secondary">
                            (Optional)
                            </span>
                        </label>

                        <textarea
                            id="context"
                            rows="4"
                            placeholder="Provide any additional information that might help with verification..."
                            className="w-full resize-y rounded-lg border border-border px-4 py-3 outline-none focus:border-brand-600"
                        />

                        <p className="mt-2 text-xs text-text-secondary">
                            Add relevant background information, dates, or other details.
                        </p>
                        </div>

                    {/* Submit Button */}
                    <div className="border-t border-border pt-6">
                    <button
                        type="submit"
                        className="btn-primary w-full sm:w-auto"
                    >
                        Submit for Verification
                    </button>

                    <p className="mt-3 text-xs text-text-secondary">
                        Your claim will be submitted for AI-assisted analysis.
                        Verification results may require human review.
                    </p>
                    </div>

            </form>
            </div>

      </div>
    </main>
  );
}

export default SubmitClaim;