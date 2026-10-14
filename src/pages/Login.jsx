import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("sky_wardens_remember_me") !== "false";
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem("sky_wardens_saved_email") || "";
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem("sky_wardens_saved_password") || "";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleRememberMeChange = (checked) => {
    setRememberMe(checked);
    if (!checked) {
      localStorage.setItem("sky_wardens_remember_me", "false");
      localStorage.removeItem("sky_wardens_saved_email");
      localStorage.removeItem("sky_wardens_saved_password");
    } else {
      localStorage.setItem("sky_wardens_remember_me", "true");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your administrative email address.");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Please enter your account password.");
      return;
    }

    setIsLoading(true);

    login(email, password)
      .then(() => {
        if (rememberMe) {
          localStorage.setItem("sky_wardens_remember_me", "true");
          localStorage.setItem("sky_wardens_saved_email", email.trim());
          localStorage.setItem("sky_wardens_saved_password", password);
        } else {
          localStorage.setItem("sky_wardens_remember_me", "false");
          localStorage.removeItem("sky_wardens_saved_email");
          localStorage.removeItem("sky_wardens_saved_password");
        }
        setIsLoading(false);
        setSuccessMessage("Authentication successful. Redirecting to Management Console...");
      })
      .catch((err) => {
        setIsLoading(false);
        setErrorMessage(
          err.response?.data?.message || "Invalid credentials. Please verify your email and password."
        );
      });
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative bg-cover bg-center bg-no-repeat font-sans selection:bg-[#105784] selection:text-white p-4 sm:p-6"
      style={{ backgroundImage: "url('/login-bg.jpg')" }}
    >
      {/* Background Dark Overlay for Aerospace Enterprise Aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#09111e]/85 via-[#0b1526]/75 to-[#060c16]/90 backdrop-blur-[1px] pointer-events-none" />

      {/* Main Centered Login Section */}
      <div className="w-full max-w-[430px] relative z-10 my-auto">
        {/* DashboardKit White Auth Card */}
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-8 sm:p-9 transition-all">
          {/* Header / Brand */}
          <div className="text-center mb-6">
            <img
              src="/sky-wardens-logo.png"
              alt="Sky Wardens"
              className="h-12 w-auto object-contain mx-auto mb-3"
            />
            <h1 className="text-2xl font-bold text-[#1c232f] tracking-tight">
              Sign in
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your credentials to access the admin portal.
            </p>
          </div>

          {/* Error Notification */}
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Notification */}
          {successMessage && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@skywardens.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#ced4da] rounded-lg text-sm text-[#212529] placeholder-gray-400 focus:outline-none focus:border-[#105784] focus:ring-3 focus:ring-[#105784]/15 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModal(true);
                    setForgotSent(false);
                    setForgotEmail(email);
                  }}
                  className="text-xs text-[#105784] hover:text-[#0c4366] font-medium hover:underline transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#ced4da] rounded-lg text-sm text-[#212529] placeholder-gray-400 focus:outline-none focus:border-[#105784] focus:ring-3 focus:ring-[#105784]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Credentials Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => handleRememberMeChange(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#105784] focus:ring-[#105784] transition"
                />
                <span className="text-xs font-medium text-gray-600">
                  Save credentials on this device
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-[#105784] hover:bg-[#0d476c] text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Autofill Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center mb-2.5">
              Quick Access Credentials (Click to Autofill)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@skywardens.com");
                  setPassword("SkyWardens@2026");
                  setErrorMessage("");
                }}
                className="p-2 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-slate-200 rounded-lg text-left text-[11px] transition cursor-pointer"
              >
                <div className="font-bold text-[#105784]">👑 Super Admin</div>
                <div className="text-[10px] text-gray-500 font-mono truncate">admin@skywardens.com</div>
                <div className="text-[9px] text-gray-400 mt-0.5">Full System + Leads</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("v.malhotra@skywardens.com");
                  setPassword("SkyWardens@2026");
                  setErrorMessage("");
                }}
                className="p-2 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-slate-200 rounded-lg text-left text-[11px] transition cursor-pointer"
              >
                <div className="font-bold text-emerald-700">🛡️ Normal Admin</div>
                <div className="text-[10px] text-gray-500 font-mono truncate">v.malhotra@skywardens.com</div>
                <div className="text-[9px] text-gray-400 mt-0.5">Operations (No Leads)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Under Card Contact Link */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-300">
            Need access? Contact{" "}
            <a
              href="mailto:security@skywardens.com"
              className="text-sky-300 hover:text-white font-medium underline underline-offset-2 transition-colors"
            >
              security@skywardens.com
            </a>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 relative">
            <h3 className="text-lg font-bold text-[#1c232f]">Reset Password</h3>
            <p className="text-xs text-gray-500 mt-1">
              Enter your corporate email address to receive password recovery instructions.
            </p>

            {forgotSent ? (
              <div className="my-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                A verification link has been dispatched to <strong>{forgotEmail}</strong>.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@skywardens.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#105784]"
                />
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="w-full py-2 bg-[#105784] hover:bg-[#0c476c] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Send Reset Link
                </button>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setForgotModal(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
