import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";

function VerificationHistory() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const records = [
    {
        id: 1,
        title: "Voter registration deadline claim",
        date: "Submitted recently",
        status: "Supported",
    },
    {
        id: 2,
        title: "Election voting date announcement",
        date: "Submitted 2 days ago",
        status: "Partially Supported",
    },
    {
        id: 3,
        title: "Voting machine-related claim",
        date: "Submitted 4 days ago",
        status: "Contradicted",
    },
    ];
    const filteredRecords = records.filter((record) => {
    const matchesSearch = record.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
        selectedStatus === "All" ||
        record.status === selectedStatus;

    return matchesSearch && matchesStatus;
    });
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">
          Verification History
        </h1>

        <p className="mt-2 text-text-secondary">
          Track and review your previous claim submissions.
        </p>

        {/* History Statistics */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

        <div className="card">
            <p className="text-sm font-medium text-text-secondary">
            Total Verifications
            </p>
            <h2 className="mt-3 text-3xl font-bold">24</h2>
            <p className="mt-2 text-sm text-text-secondary">
            All submitted claims
            </p>
        </div>

        <div className="card">
            <p className="text-sm font-medium text-text-secondary">
            Completed
            </p>
            <h2 className="mt-3 text-3xl font-bold text-success">19</h2>
            <p className="mt-2 text-sm text-text-secondary">
            Verification reports available
            </p>
        </div>

        <div className="card">
            <p className="text-sm font-medium text-text-secondary">
            Under Review
            </p>
            <h2 className="mt-3 text-3xl font-bold text-warning">5</h2>
            <p className="mt-2 text-sm text-text-secondary">
            Awaiting further review
            </p>
        </div>

        </div>

        {/* Verification Records */}
        <div className="mt-10">
        <h2 className="text-xl font-bold">
            Your Verification Records
        </h2>

        <p className="mt-2 text-sm text-text-secondary">
            A list of your recently submitted claims.
        </p>

        <div className="mt-5">
        <input
            type="text"
            placeholder="Search your claims..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-brand-600"
        />

        {/* Status Filter */}
        <div className="mt-4">
        <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-brand-600 sm:w-64"
        >
            <option value="All">All Verifications</option>
            <option value="Supported">Supported</option>
            <option value="Contradicted">Contradicted</option>
            <option value="Partially Supported">Partially Supported</option>
        </select>
        </div>

        <Button
        type="button"
        variant="secondary"
        onClick={() => {
            setSearchTerm("");
            setSelectedStatus("All");
        }}
        className="mt-3 text-sm"
        >
        Clear Filters
        </Button>

        </div>

        <div className="mt-5 space-y-4">

            {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                    <div className="card" key={record.id}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                        <h3 className="font-semibold">
                            {record.title}
                        </h3>

                        <p className="mt-2 text-sm text-text-secondary">
                            {record.date}
                        </p>

                        <Link
                        to="/verification-result"
                        className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
                        >
                        View Results →
                        </Link>
                        </div>

                        <span
                        className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
                            record.status === "Supported"
                            ? "bg-green-100 text-green-700"
                            : record.status === "Contradicted"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                        >
                        {record.status}
                        </span>

                    </div>
                    </div>
                ))
                ) : (
                <p className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-text-secondary">
                No matching verification records found.
                </p>
                )}

        </div>
        </div>

      </div>
    </main>
  );
}

export default VerificationHistory; 