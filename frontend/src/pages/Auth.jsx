import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Box } from "lucide-react";
import { api } from "../lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Auth() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === "signup";

  const emailError =
    email.length > 0 && !EMAIL_RE.test(email) ? "Enter a valid email address." : "";
  const passwordError =
    isSignUp && password.length > 0 && password.length < 8
      ? "Password needs at least 8 characters."
      : "";
  const confirmError =
    isSignUp && confirmPassword.length > 0 && confirmPassword !== password
      ? "Passwords don't match."
      : "";

  function switchMode(next) {
    setMode(next);
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (isSignUp && password.length < 8) {
      setError("Password needs at least 8 characters.");
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await api.register(email, password);
        const tokenRes = await api.login(email, password);
        localStorage.setItem("access_token", tokenRes.access_token);
      } else {
        const tokenRes = await api.login(email, password);
        localStorage.setItem("access_token", tokenRes.access_token);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#15171C] text-[#E8E8E6] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#4ADE80]/10 border border-[#4ADE80]/30 flex items-center justify-center">
            <Box size={20} className="text-[#4ADE80]" />
          </div>
          <span className="font-mono text-lg font-semibold tracking-tight text-[#E8E8E6]">
            RepoMind
          </span>
        </div>

        <div className="bg-[#1B1E25] border border-white/[0.06] rounded-xl p-6 shadow-xl shadow-black/30">
          {/* Toggle */}
          <div className="grid grid-cols-2 mb-6 bg-black/20 rounded-lg p-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`py-2 text-sm font-medium rounded-md transition-colors ${
                !isSignUp
                  ? "bg-[#2A2E38] text-[#E8E8E6]"
                  : "text-[#8B92A0] hover:text-[#E8E8E6]"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`py-2 text-sm font-medium rounded-md transition-colors ${
                isSignUp
                  ? "bg-[#2A2E38] text-[#E8E8E6]"
                  : "text-[#8B92A0] hover:text-[#E8E8E6]"
              }`}
            >
              Sign up
            </button>
          </div>

          <h1 className="text-lg font-semibold mb-1">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-[#8B92A0] mb-6">
            {isSignUp
              ? "Start indexing a codebase in a couple minutes."
              : "Sign in to get back to your projects."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#8B92A0] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="name@company.com"
                className={`w-full bg-[#12141A] border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-[#5A6070] focus:border-[#4ADE80]/50 ${
                  emailError ? "border-[#F5A524]/60" : "border-white/[0.08]"
                }`}
              />
              {emailError && (
                <p className="mt-1.5 text-xs text-[#F5A524]">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#8B92A0] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  className={`w-full bg-[#12141A] border rounded-lg px-3 py-2.5 pr-10 text-sm outline-none transition-colors placeholder:text-[#5A6070] focus:border-[#4ADE80]/50 ${
                    passwordError ? "border-[#F5A524]/60" : "border-white/[0.08]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6070] hover:text-[#8B92A0]"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1.5 text-xs text-[#F5A524]">{passwordError}</p>
              )}
            </div>

            {/* Confirm password (sign up only) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-[#8B92A0] mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`w-full bg-[#12141A] border rounded-lg px-3 py-2.5 pr-10 text-sm outline-none transition-colors placeholder:text-[#5A6070] focus:border-[#4ADE80]/50 ${
                      confirmError ? "border-[#F5A524]/60" : "border-white/[0.08]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6070] hover:text-[#8B92A0]"
                    tabIndex={-1}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmError && (
                  <p className="mt-1.5 text-xs text-[#F5A524]">{confirmError}</p>
                )}
              </div>
            )}

            {error && (
              <div className="text-sm text-[#F5A524] bg-[#F5A524]/10 border border-[#F5A524]/25 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#4ADE80] text-[#0B0D10] font-medium text-sm rounded-lg py-2.5 mt-2 hover:bg-[#3fce70] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="text-xs text-center text-[#5A6070] mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isSignUp ? "signin" : "signup")}
              className="text-[#4ADE80] hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
