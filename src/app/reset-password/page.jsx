"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  KeyRound,
} from "lucide-react";
import { resetPassword } from "../../services/AuthService";
import { toast } from "react-toastify";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Password criteria checks
  const criteria = {
    length: newPassword.length >= 10,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    digit: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
  };

  const passedCriteriaCount = Object.values(criteria).filter(Boolean).length;
  const isFormValid =
    passedCriteriaCount === 5 &&
    newPassword === confirmPassword &&
    confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage("No password reset token was detected in the URL.");
      return;
    }
    if (!isFormValid) {
      if (newPassword !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
      } else {
        setErrorMessage("Please fulfill all password security complexity requirements.");
      }
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await resetPassword(token, newPassword, confirmPassword);
      setIsSuccess(true);
      toast.success("Password reset successful! You can now sign in.");
    } catch (err) {
      console.error("Reset password error:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to reset password. The link may have expired.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-white/15 shadow-xl text-center bg-white/95 dark:bg-[#12121b]/90">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Missing Reset Token
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
          No reset token was found. Please request a new password reset link from the login page.
        </p>
        <Link
          href="/login"
          className="btn-theatre-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs mt-6"
        >
          <span>Back to Sign In</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-white/15 shadow-xl dark:shadow-2xl relative z-10 bg-white/95 dark:bg-[#12121b]/90">
      <div className="text-center mb-6">
        <Link href="/" className="inline-block mb-3">
          <img
            src="/logo-nataka.png"
            alt="Nataka.LK"
            className="h-9 w-auto object-contain mx-auto block dark:hidden"
          />
          <img
            src="/logo-nataka-white.png"
            alt="Nataka.LK"
            className="h-9 w-auto object-contain mx-auto hidden dark:block"
          />
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
          Choose New Password
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Create a secure password to keep your Nataka.LK account and tickets safe
        </p>
      </div>

      {isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Password Updated!
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Your password has been securely changed and all previous lockout flags cleared.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="btn-theatre-gold w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-500/40 text-xs text-red-700 dark:text-red-200 leading-snug">
              {errorMessage}
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Min 10 characters"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-rose-500 mt-1">
                Passwords do not match.
              </p>
            )}
          </div>

          {/* Password Strength Meter */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181824] border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                Password Strength:
              </span>
              <span
                className={`font-bold ${
                  passedCriteriaCount <= 2
                    ? "text-rose-500"
                    : passedCriteriaCount <= 4
                    ? "text-amber-500"
                    : "text-emerald-500"
                }`}
              >
                {passedCriteriaCount <= 2
                  ? "Weak"
                  : passedCriteriaCount <= 4
                  ? "Moderate"
                  : "Strong & Compliant"}
              </span>
            </div>

            {/* Strength Bar */}
            <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden flex gap-1">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`h-full flex-1 rounded-full transition-colors ${
                    step <= passedCriteriaCount
                      ? passedCriteriaCount <= 2
                        ? "bg-rose-500"
                        : passedCriteriaCount <= 4
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                      : "bg-transparent"
                  }`}
                />
              ))}
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
              <div
                className={`flex items-center gap-1.5 ${
                  criteria.length ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400"
                }`}
              >
                {criteria.length ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>10+ Characters</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  criteria.uppercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400"
                }`}
              >
                {criteria.uppercase ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>Uppercase (A-Z)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  criteria.lowercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400"
                }`}
              >
                {criteria.lowercase ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>Lowercase (a-z)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  criteria.digit ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400"
                }`}
              >
                {criteria.digit ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>Number (0-9)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 col-span-2 ${
                  criteria.special ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400"
                }`}
              >
                {criteria.special ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>Special Symbol (!@#$%^&*...)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="btn-theatre-gold w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Save New Password</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <ModernHeader />
      <main className="min-h-[82vh] bg-slate-50 dark:bg-[#0d0d12] flex items-center justify-center p-4 py-16 relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 dark:bg-red-900/15 rounded-full blur-[140px] pointer-events-none" />
        <Suspense
          fallback={
            <div className="p-8 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </main>
      <ModernFooter />
    </>
  );
}
