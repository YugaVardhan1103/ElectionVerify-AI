import Link from "next/link";
import Card from "@/components/Card";

export default function ClaimNotFound() {
  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <Card className="p-10">
          <h1 className="text-2xl font-bold text-text-primary">
            Claim Record Not Found
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            The requested election claim could not be located in our records.
          </p>
          <div className="mt-6">
            <Link href="/verification-history" className="btn-primary">
              &larr; Back to Verification History
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
