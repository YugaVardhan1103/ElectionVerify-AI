import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/useTheme.js";
import { useAuth } from "../context/useAuth.js";

/**
 * ElectionVerify AI - Primary Navigation Header
 *
 * Features:
 * - Theme-compatible styling (clean light and dark mode appearance)
 * - Dynamic auth-aware navigation (shows public vs authenticated links)
 * - Semantic header and navigation landmark with accessible labels
 * - Responsive desktop and mobile navigation layouts
 * - Global accessible Theme Toggle (Sun/Moon) with visible keyboard focus
 * - Keyboard navigation and focus ring indicators
 */
function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const getLinkClass = ({ isActive }) =>
    `transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-2 py-1 ${
      isActive
        ? "font-semibold text-brand-600 dark:text-brand-400"
        : "text-text-secondary hover:text-text-primary"
    }`;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMobileMenu();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface text-text-primary shadow-sm">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
      >
        {/* Brand Logo Link */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="rounded text-2xl font-bold tracking-tight text-text-primary transition-colors hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:text-brand-400"
        >
          ElectionVerify AI
        </Link>

        {/* Desktop Navigation Links & Controls */}
        <div className="hidden items-center gap-6 sm:flex">
          {!isAuthenticated ? (
            <>
              <NavLink to="/" className={getLinkClass} end>
                Home
              </NavLink>
              <NavLink to="/login" className={getLinkClass}>
                Login
              </NavLink>
              <NavLink to="/signup" className={getLinkClass}>
                Sign Up
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className={getLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/submit-claim" className={getLinkClass}>
                Submit Claim
              </NavLink>
              <NavLink to="/verification-history" className={getLinkClass}>
                History
              </NavLink>
              <NavLink to="/profile" className={getLinkClass}>
                Profile
              </NavLink>
              {(user?.role === "reviewer" || user?.role === "admin") && (
                <NavLink to="/reviewer-queue" className={getLinkClass}>
                  Review Queue
                </NavLink>
              )}
              {user?.avatarUrl ? (
                <Link
                  to="/profile"
                  className="flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  title={user.name || "Profile"}
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-500/30"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded px-2 py-1 text-sm font-medium text-text-secondary transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Logout
              </button>
            </>
          )}

          {/* Theme Toggle Button (Desktop) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${resolvedTheme === "Dark" ? "light" : "dark"} mode`}
            title={`Switch to ${resolvedTheme === "Dark" ? "light" : "dark"} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-slate-100 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-800"
          >
            {resolvedTheme === "Dark" ? (
              // Sun icon for Dark -> Light
              <svg
                className="h-5 w-5 text-amber-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              // Moon icon for Light -> Dark
              <svg
                className="h-5 w-5 text-slate-600 dark:text-slate-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Controls: Theme Toggle & Hamburger Button */}
        <div className="flex items-center gap-3 sm:hidden">
          {/* Theme Toggle Button (Mobile) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${resolvedTheme === "Dark" ? "light" : "dark"} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-slate-100 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-800"
          >
            {resolvedTheme === "Dark" ? (
              <svg
                className="h-4 w-4 text-amber-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 text-slate-600 dark:text-slate-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label="Toggle mobile menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-slate-100 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-800"
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-border bg-surface px-6 py-4 sm:hidden"
        >
          <div className="flex flex-col space-y-3">
            {!isAuthenticated ? (
              <>
                <NavLink
                  to="/"
                  onClick={closeMobileMenu}
                  className={getLinkClass}
                  end
                >
                  Home
                </NavLink>
                <NavLink
                  to="/login"
                  onClick={closeMobileMenu}
                  className={getLinkClass}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={closeMobileMenu}
                  className={getLinkClass}
                >
                  Sign Up
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className={getLinkClass}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/submit-claim"
                  onClick={closeMobileMenu}
                  className={getLinkClass}
                >
                  Submit Claim
                </NavLink>
                <NavLink
                  to="/verification-history"
                  onClick={closeMobileMenu}
                  className={getLinkClass}
                >
                  History
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={closeMobileMenu}
                  className={getLinkClass}
                >
                  Profile
                </NavLink>
                {(user?.role === "reviewer" || user?.role === "admin") && (
                  <NavLink
                    to="/reviewer-queue"
                    onClick={closeMobileMenu}
                    className={getLinkClass}
                  >
                    Review Queue
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded px-2 py-1 text-left text-sm font-medium text-danger hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
