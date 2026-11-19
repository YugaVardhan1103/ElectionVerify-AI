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
  const [activeSocialModal, setActiveSocialModal] = useState(null); // 'google' | 'facebook' | null
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [modalError, setModalError] = useState("");

  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || "/dashboard";

  function openSocialModal(provider) {
    setGeneralError("");
    setModalError("");
    setShowCustomInput(false);
    setCustomEmail("");
    setCustomName("");
    setActiveSocialModal(provider);
  }

  async function handleConfirmSocial(accountData) {
    setModalError("");
    setSocialLoading(accountData.provider);
    const result = await socialLogin(accountData);
    setSocialLoading(null);

    if (result.success) {
      setActiveSocialModal(null);
      navigate(from, { replace: true });
    } else {
      setModalError(result.error || `${accountData.provider} login failed.`);
    }
  }

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
            Login to your ElectionVerify AI demo session
          </p>
        </div>

        {/* Demo Mode Notice */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300">
          <span className="font-semibold">Demo Notice:</span> This application runs
          in client demonstration mode. Any valid email format and compliant password
          (8+ characters, upper, lower, number) can be used to explore the platform.
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
                placeholder="demo.user@example.com"
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
              onClick={() => openSocialModal("google")}
              disabled={isLoading || Boolean(socialLoading)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary shadow-sm transition hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:active:bg-slate-700"
              aria-label="Sign in with Google"
            >
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
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => openSocialModal("facebook")}
              disabled={isLoading || Boolean(socialLoading)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary shadow-sm transition hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:active:bg-slate-700"
              aria-label="Sign in with Facebook"
            >
              <svg className="h-4 w-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Google Account Chooser Modal */}
          {activeSocialModal === "google" && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
              role="dialog"
              aria-modal="true"
              aria-labelledby="google-modal-title"
              onClick={() => !socialLoading && setActiveSocialModal(null)}
            >
              <div
                className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2.5">
                    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
                    <span className="text-sm font-semibold text-text-primary">Google Account</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSocialModal(null)}
                    disabled={Boolean(socialLoading)}
                    className="text-text-secondary hover:text-text-primary text-lg leading-none p-1 rounded-md"
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>

                <h2 id="google-modal-title" className="text-xl font-bold text-text-primary">
                  Choose an account
                </h2>
                <p className="mt-1 text-xs text-text-secondary">
                  to continue to <span className="font-semibold text-text-primary">ElectionVerify AI</span>
                </p>

                {modalError && (
                  <div className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs text-danger dark:bg-rose-950/40 dark:text-rose-300">
                    {modalError}
                  </div>
                )}

                {!showCustomInput ? (
                  <div className="mt-4 space-y-2">
                    {/* Suggested Account 1 */}
                    <button
                      type="button"
                      disabled={Boolean(socialLoading)}
                      onClick={() =>
                        handleConfirmSocial({
                          provider: "google",
                          email: "voter.citizen@gmail.com",
                          name: "Voter Citizen",
                        })
                      }
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                    >
                      <div className="h-9 w-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        V
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-text-primary truncate">Voter Citizen</div>
                        <div className="text-xs text-text-secondary truncate">voter.citizen@gmail.com</div>
                      </div>
                      {socialLoading === "google" && (
                        <div className="h-4 w-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin shrink-0" />
                      )}
                    </button>

                    {/* Suggested Account 2 */}
                    <button
                      type="button"
                      disabled={Boolean(socialLoading)}
                      onClick={() =>
                        handleConfirmSocial({
                          provider: "google",
                          email: "demo.voter@gmail.com",
                          name: "Demo Voter",
                        })
                      }
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                    >
                      <div className="h-9 w-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        D
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-text-primary truncate">Demo Voter</div>
                        <div className="text-xs text-text-secondary truncate">demo.voter@gmail.com</div>
                      </div>
                    </button>

                    {/* Use another Google account */}
                    <button
                      type="button"
                      disabled={Boolean(socialLoading)}
                      onClick={() => {
                        setShowCustomInput(true);
                        setCustomEmail(email || "");
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-border hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left text-brand-600 dark:text-brand-400"
                    >
                      <div className="h-9 w-9 rounded-full border border-current flex items-center justify-center text-base shrink-0">
                        +
                      </div>
                      <span className="text-sm font-medium">Use another Google account</span>
                    </button>
                  </div>
                ) : (
                  <form
                    className="mt-4 space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!customEmail || !customEmail.includes("@")) {
                        setModalError("Please enter a valid Google email address.");
                        return;
                      }
                      handleConfirmSocial({
                        provider: "google",
                        email: customEmail,
                        name: customName || customEmail.split("@")[0],
                      });
                    }}
                  >
                    <div>
                      <label className="block text-xs font-medium text-text-primary mb-1">
                        Google Email Address *
                      </label>
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => {
                          setCustomEmail(e.target.value);
                          setModalError("");
                        }}
                        placeholder="you@gmail.com"
                        required
                        autoFocus
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-primary mb-1">
                        Display Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCustomInput(false)}
                        className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={Boolean(socialLoading)}
                        className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {socialLoading ? "Connecting..." : "Confirm & Sign In"}
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-5 border-t border-border pt-3 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveSocialModal(null)}
                    disabled={Boolean(socialLoading)}
                    className="text-xs text-text-secondary hover:text-text-primary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Facebook Account Confirmation Modal */}
          {activeSocialModal === "facebook" && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
              role="dialog"
              aria-modal="true"
              aria-labelledby="facebook-modal-title"
              onClick={() => !socialLoading && setActiveSocialModal(null)}
            >
              <div
                className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2.5">
                    <svg className="h-6 w-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-text-primary">Facebook Login</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSocialModal(null)}
                    disabled={Boolean(socialLoading)}
                    className="text-text-secondary hover:text-text-primary text-lg leading-none p-1 rounded-md"
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>

                <h2 id="facebook-modal-title" className="text-xl font-bold text-text-primary">
                  Log in with Facebook
                </h2>
                <p className="mt-1 text-xs text-text-secondary">
                  Confirm your Facebook account to continue to <span className="font-semibold text-text-primary">ElectionVerify AI</span>.
                </p>

                {modalError && (
                  <div className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs text-danger dark:bg-rose-950/40 dark:text-rose-300">
                    {modalError}
                  </div>
                )}

                <form
                  className="mt-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const targetEmail = customEmail || "voter@facebook.com";
                    const targetName = customName || "Facebook Voter";
                    handleConfirmSocial({
                      provider: "facebook",
                      email: targetEmail,
                      name: targetName,
                    });
                  }}
                >
                  <div className="rounded-xl border border-border p-3.5 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#1877F2] text-white font-bold flex items-center justify-center text-base shrink-0">
                      f
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-text-primary truncate">
                        {customName || "Facebook Voter"}
                      </div>
                      <div className="text-xs text-text-secondary truncate">
                        {customEmail || "voter@facebook.com"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">
                      Facebook Account / Email
                    </label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => {
                        setCustomEmail(e.target.value);
                        setModalError("");
                      }}
                      placeholder="voter@facebook.com"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Facebook Voter"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <p className="text-[11px] text-text-secondary leading-tight">
                    ElectionVerify AI will receive your name, profile picture, and email address.
                  </p>

                  <button
                    type="submit"
                    disabled={Boolean(socialLoading)}
                    className="w-full rounded-lg bg-[#1877F2] py-2.5 text-sm font-semibold text-white hover:bg-[#166fe5] active:bg-[#1465d2] transition disabled:opacity-50 shadow-sm"
                  >
                    {socialLoading ? "Connecting..." : `Continue as ${customName || "Facebook Voter"}`}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveSocialModal(null)}
                      disabled={Boolean(socialLoading)}
                      className="text-xs text-text-secondary hover:text-text-primary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
