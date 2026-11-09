
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import FormInput from "../components/FormInput";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain uppercase, lowercase and numeric characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreed) {
      setError("Please accept the Terms and Conditions.");
      return;
    }

    setError("");
    alert("Signup form validation successful!");
  }

  return (
    <main className="flex min-h-[85vh] items-center justify-center px-6 py-12">

      <div className="w-full max-w-md">

        {/* Page Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Create Your Account
          </h1>

          <p className="mt-2 text-text-secondary">
            Join ElectionVerify AI and explore verified information.
          </p>
        </div>

        {/* Signup Form */}
        <div className="card">

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>

            {/* Full Name */}
            <div>
              <FormInput
                label="Full Name"
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <FormInput
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            
  {/* Password */}
    <div>
      <label
        htmlFor="password"
        className="mb-2 block text-sm font-medium"
      >
        Password
      </label>

      <div className="relative">
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a password"
          className="w-full rounded-lg border border-border px-4 py-3 pr-20 outline-none focus:border-brand-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-brand-600"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <p className="mt-2 text-xs text-text-secondary">
        Password must be at least 8 characters and include uppercase,
        lowercase, and numeric characters.
      </p>
    </div>


            
        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium"
          >
            Confirm Password
          </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                className="w-full rounded-lg border border-border px-4 py-3 pr-20 outline-none focus:border-brand-600"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-brand-600"
                aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>


            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />

                <span>
                  I agree to the Terms and Conditions
                  and Privacy Policy.
                </span>
              </label>
            </div>

            {error && (
              <p className="text-sm text-danger">
                {error}
              </p>
            )}

            {/* Signup Button */}
            <Button
              type="submit"
              className="w-full"
            >
              Create Account
            </Button>

          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              Login
            </Link>
          </p>

        </div>

      </div>

    </main>
  );
}

export default Signup;
