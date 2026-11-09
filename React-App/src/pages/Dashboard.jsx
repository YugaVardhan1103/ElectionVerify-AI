import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-sm font-semibold text-brand-600">
            OVERVIEW
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Welcome back!
          </h1>

          <p className="mt-2 text-text-secondary">
            Here's an overview of your election claim verification activity.
          </p>

          {/* Statistics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

              <div className="card">
                <p className="text-sm font-medium text-text-secondary">
                  Total Claims Checked
                </p>
                <h2 className="mt-3 text-3xl font-bold">24</h2>
                <p className="mt-2 text-sm text-text-secondary">
                  Total verifications
                </p>
              </div>

              <div className="card">
                <p className="text-sm font-medium text-text-secondary">
                  Supported
                </p>
                <h2 className="mt-3 text-3xl font-bold text-success">12</h2>
                <p className="mt-2 text-sm text-text-secondary">
                  Claims supported by evidence
                </p>
              </div>

              <div className="card">
                <p className="text-sm font-medium text-text-secondary">
                  Contradicted
                </p>
                <h2 className="mt-3 text-3xl font-bold text-danger">7</h2>
                <p className="mt-2 text-sm text-text-secondary">
                  Claims contradicted by evidence
                </p>
              </div>

              <div className="card">
                <p className="text-sm font-medium text-text-secondary">
                  Under Review
                </p>
                <h2 className="mt-3 text-3xl font-bold text-warning">5</h2>
                <p className="mt-2 text-sm text-text-secondary">
                  Claims awaiting further review
                </p>
              </div>

            </div>

          {/* Quick Action */}
            <div className="mt-10 card flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold">
                  Verify a New Claim
                </h2>

                <p className="mt-2 text-sm text-text-secondary">
                  Have an election-related claim you're unsure about?
                  Submit it to investigate its credibility.
                </p>
              </div>

              <Button
                onClick={() => navigate("/submit-claim")}
                className="whitespace-nowrap"
              >
                + Verify a Claim
              </Button>
            </div>

          {/* Recent Activity */}
            <div className="mt-10">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    Recent Activity
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Your latest claim verification activities.
                  </p>
                </div>

                <button
                  type="button"
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  View All
                </button>
              </div>

              <div className="card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold">
                      Voter registration deadline claim
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      Submitted recently
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    Supported
                  </span>
                </div>
              </div>
            </div>

        </div>
      </div>
    </main>
  );
}

export default Dashboard;