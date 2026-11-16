"use client";

import { useEffect } from "react";
import Button from "@/components/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[NextJS Error Boundary Caught]:", error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="card max-w-md p-8">
        <h2 className="text-2xl font-bold text-text-primary">
          Something went wrong
        </h2>
        <p className="mt-3 text-sm text-text-secondary">
          An unexpected error occurred while rendering this page.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="primary" onClick={() => reset()}>
            Try Again
          </Button>
          <Button
            variant="secondary"
            onClick={() => (window.location.href = "/")}
          >
            Go to Home
          </Button>
        </div>
      </div>
    </main>
  );
}
