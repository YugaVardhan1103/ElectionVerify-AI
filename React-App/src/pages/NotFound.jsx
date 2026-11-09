import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-7xl font-bold text-brand-600">
        404
      </h1>

      <h2 className="mt-4 text-2xl font-bold">
        Page Not Found
      </h2>

      <p className="mt-3 text-text-secondary">
        Sorry, the page you're looking for doesn't exist.
      </p>

      <Link to="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </main>
  );
}

export default NotFound;