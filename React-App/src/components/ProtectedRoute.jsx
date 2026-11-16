import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

/**
 * ElectionVerify AI - Protected Route Wrapper
 *
 * Verifies authentication state. Renders loading indicator during session initialization,
 * and redirects unauthenticated users to /login with return location state.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
