import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-7xl font-bold text-brand-600">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-text-primary">
        Page Not Found
      </h2>
      <p className="mt-3 text-sm text-text-secondary">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </main>
  );
}
