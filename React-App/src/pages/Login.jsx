
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import FormInput from "../components/FormInput";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    alert("Form validation successful!");
  }

  return (
    <main className="flex min-h-[85vh] items-center justify-center px-6 py-12">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Welcome Back
          </h1>

          <p className="mt-2 text-text-secondary">
            Login to your ElectionVerify AI account
          </p>
        </div>

        <div className="card">

          <form
            className="space-y-5"
            onSubmit={handleSubmit}
            noValidate
          >

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
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-border px-4 py-3 pr-20 outline-none focus:border-brand-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-brand-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                Forgot password?
              </Link>

            </div>

            {error && (
              <p className="text-sm text-danger">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
            >
              Login
            </Button>

          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-brand-600 hover:text-brand-700"
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
