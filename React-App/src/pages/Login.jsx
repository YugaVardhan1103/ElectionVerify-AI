import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import { useAuth } from "../context/useAuth.js";
import { validateEmail, validatePassword } from "../utils/validators.js";

/**
 * ElectionVerify AI - Login Page
 *
 * Implements client-side demo authentication with field validation
 * and explicit demo-mode notices.
 */
function Login() {
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(() => location.state?.email || "");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    () => location.state?.successMessage || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || "/dashboard";

  // Initialize Facebook SDK if app ID is provided
  useState(() => {
    if (typeof window !== "undefined") {
      const fbAppId = import.meta.env?.FACEBOOK_APP_ID;
      if (fbAppId) {
        window.fbAsyncInit = function () {
          window.FB?.init({
            appId: fbAppId,
            cookie: true,
            xfbml: true,
            version: "v19.0",
          });
        };
        if (window.FB) {
          window.FB.init({
            appId: fbAppId,
            cookie: true,
            xfbml: true,
            version: "v19.0",
          });
        }
      }
    }
  });

  const handleGoogleSignIn = () => {
    setGeneralError("");
    const googleClientId = import.meta.env?.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      setGeneralError(
        "Google OAuth is not configured. Please add GOOGLE_CLIENT_ID to your .env file."
      );
      return;
    }

    setSocialLoading("google");

    // Helper to identify user cancellations, closed popups, or denied consent
    const isCancellation = (err, desc) => {
      const combined = `${err || ""} ${desc || ""}`.toLowerCase();
      return (
        combined.includes("access_denied") ||
        combined.includes("popup_closed") ||
        combined.includes("closed_by_user") ||
        combined.includes("user_cancel") ||
        combined.includes("cancelled") ||
        combined.includes("canceled") ||
        combined.includes("denied") ||
        combined.includes("consent") ||
        combined.includes("immediate_failed")
      );
    };

    // Safety timeout: automatically reset loading spinner if no response after 60s
    let timeoutTimer = setTimeout(() => {
      setSocialLoading(null);
    }, 60000);

    const clearAllTimers = () => {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
    };

    // 1. Preferred: Google Identity Services (GIS) Token Client
    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid email profile",
          prompt: "select_account",
          error_callback: (err) => {
            clearAllTimers();
            // Stop loading spinner immediately
            setSocialLoading(null);
            // If user closed popup, clicked Cancel, or denied consent: return to login without error
            if (err?.type && isCancellation(err.type, err.message)) {
              return;
            }
            if (err?.type === "popup_failed_to_open") {
              setGeneralError(
                "Popup was blocked by your browser. Please allow popups for this site."
              );
            } else if (err?.message) {
              setGeneralError(err.message);
            }
          },
          callback: async (tokenResponse) => {
            clearAllTimers();
            // Handle error response from Google OAuth
            if (tokenResponse.error) {
              // Stop loading spinner immediately
              setSocialLoading(null);
              // When user closes popup, clicks Cancel, or denies consent:
              // Return to login page without showing an error or redirecting
              if (isCancellation(tokenResponse.error, tokenResponse.error_description)) {
                return;
              }
              // Display other OAuth errors
              setGeneralError(
                tokenResponse.error_description || tokenResponse.error || "Google sign-in failed."
              );
              return;
            }

            // Successful token response: proceed with authentication
            try {
              const result = await socialLogin({
                provider: "google",
                accessToken: tokenResponse.access_token,
              });

              setSocialLoading(null);
              if (result.success) {
                navigate(from, { replace: true });
              } else {
                setGeneralError(result.error || "Google authentication failed.");
              }
            } catch {
              setSocialLoading(null);
              setGeneralError("Authentication error occurred. Please try again.");
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (err) {
        clearAllTimers();
        console.warn("GIS token client error, falling back to popup redirect:", err);
      }
    }

    // 2. Fallback: Direct Google OAuth 2.0 Popup
    const width = 500;
    const height = 630;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth-callback.html`);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      googleClientId
    )}&redirect_uri=${redirectUri}&response_type=token&scope=email%20profile%20openid&prompt=select_account`;

    const popup = window.open(
      authUrl,
      "google_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=0,menubar=0,toolbar=0,location=1,resizable=1`
    );

    if (!popup) {
      clearAllTimers();
      setSocialLoading(null);
      setGeneralError("Popup was blocked by your browser. Please allow popups for this site.");
      return;
    }

    let pollTimer = null;

    const cleanup = () => {
      clearAllTimers();
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      window.removeEventListener("message", handleMessage);
    };

    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "OAUTH_CALLBACK") {
        cleanup();

        if (event.data.error) {
          // Stop loading spinner immediately
          setSocialLoading(null);
          // When user closes popup, clicks Cancel, or denies consent:
          // Return to login page without showing an error or redirecting
          if (isCancellation(event.data.error, event.data.error_description)) {
            return;
          }
          setGeneralError(
            event.data.error_description || event.data.error || "Google sign-in failed."
          );
          return;
        }

        try {
          const result = await socialLogin({
            provider: "google",
            accessToken: event.data.accessToken || event.data.token,
            idToken: event.data.idToken,
          });

          setSocialLoading(null);
          if (result.success) {
            navigate(from, { replace: true });
          } else {
            setGeneralError(result.error || "Google authentication failed.");
          }
        } catch {
          setSocialLoading(null);
          setGeneralError("Authentication error occurred. Please try again.");
        }
      }
    };

    window.addEventListener("message", handleMessage);

    pollTimer = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          cleanup();
          // User closed popup: stop loading immediately without showing an error
          setSocialLoading(null);
        }
      } catch {
        // Cross-origin access restriction fallback
      }
    }, 300);
  };

  const handleFacebookSignIn = () => {
    setGeneralError("");
    const facebookAppId = import.meta.env?.FACEBOOK_APP_ID;

    if (!facebookAppId) {
      setGeneralError(
        "Facebook OAuth is not configured. Please add FACEBOOK_APP_ID to your .env file."
      );
      return;
    }

    setSocialLoading("facebook");

    // 1. Preferred: Facebook JavaScript SDK
    if (window.FB) {
      try {
        window.FB.login(
          async (response) => {
            if (response.authResponse?.accessToken) {
              const result = await socialLogin({
                provider: "facebook",
                accessToken: response.authResponse.accessToken,
              });

              setSocialLoading(null);
              if (result.success) {
                navigate(from, { replace: true });
              } else {
                setGeneralError(result.error || "Facebook authentication failed.");
              }
            } else {
              setSocialLoading(null);
              setGeneralError("Facebook sign-in was cancelled or denied.");
            }
          },
          { scope: "public_profile,email" }
        );
        return;
      } catch (err) {
        console.warn("FB SDK login error, falling back to popup redirect:", err);
      }
    }

    // 2. Fallback: Direct Facebook OAuth Dialog Popup
    const width = 500;
    const height = 630;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth-callback.html`);
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(
      facebookAppId
    )}&redirect_uri=${redirectUri}&response_type=token&scope=email,public_profile`;

    const popup = window.open(
      authUrl,
      "facebook_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=0,menubar=0,toolbar=0,location=1,resizable=1`
    );

    if (!popup) {
      setSocialLoading(null);
      setGeneralError("Popup was blocked by your browser. Please allow popups for this site.");
      return;
    }

    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "OAUTH_CALLBACK") {
        window.removeEventListener("message", handleMessage);
        clearInterval(pollTimer);

        if (event.data.error) {
          setSocialLoading(null);
          setGeneralError(event.data.error || "Facebook sign-in was cancelled.");
          return;
        }

        const result = await socialLogin({
          provider: "facebook",
          accessToken: event.data.accessToken || event.data.token,
        });

        setSocialLoading(null);
        if (result.success) {
          navigate(from, { replace: true });
        } else {
          setGeneralError(result.error || "Facebook authentication failed.");
        }
      }
    };

    window.addEventListener("message", handleMessage);

    const pollTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollTimer);
        window.removeEventListener("message", handleMessage);
        setSocialLoading(null);
      }
    }, 500);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setGeneralError("");
    setSuccessMessage("");
    const errors = {};

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      errors.email = emailVal.error;
    }

    const passVal = validatePassword(password);
    if (!passVal.isValid) {
      errors.password = passVal.error;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    const result = await login({ email, password });
    setIsLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setGeneralError(result.error || "Login failed.");
    }
  }

  return (
    <main className="flex min-h-[85vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-text-secondary">
            Sign in to access your ElectionVerify AI account
          </p>
        </div>

        <div className="card">
          {successMessage && (
            <div
              role="status"
              className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3.5 text-sm text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <FormInput
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                placeholder="name@example.com"
                error={fieldErrors.email}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Password
                <span className="ml-1 text-red-500" aria-hidden="true">
                  *
                </span>
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`w-full rounded-lg border bg-surface px-4 py-3 pr-20 text-text-primary outline-none transition-colors focus:ring-2 ${
                    fieldErrors.password
                      ? "border-red-500 focus:border-red-600 focus:ring-red-500/20 dark:border-rose-500"
                      : "border-border focus:border-brand-600 focus:ring-brand-500/20"
                  }`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  aria-invalid={fieldErrors.password ? "true" : undefined}
                  aria-describedby={
                    fieldErrors.password ? "password-error" : undefined
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {fieldErrors.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 dark:text-rose-400"
                >
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-text-secondary">
                <input
                  type="checkbox"
                  className="rounded border-border text-brand-600"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>

            {generalError && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-danger dark:bg-rose-950/40 dark:text-rose-300"
              >
                {generalError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Login
            </Button>
          </form>

          {/* Social Login Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-3 text-text-secondary">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Sign-In Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || Boolean(socialLoading)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary shadow-sm transition hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:active:bg-slate-700"
              aria-label="Sign in with Google"
            >
              {socialLoading === "google" ? (
                <svg
                  className="h-4 w-4 animate-spin text-current"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookSignIn}
              disabled={isLoading || Boolean(socialLoading)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary shadow-sm transition hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:active:bg-slate-700"
              aria-label="Sign in with Facebook"
            >
              {socialLoading === "facebook" ? (
                <svg
                  className="h-4 w-4 animate-spin text-current"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span>Facebook</span>
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
