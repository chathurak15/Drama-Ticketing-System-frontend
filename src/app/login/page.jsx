/* global process */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  ShieldCheck,
  KeyRound,
  AlertOctagon,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import {
  login,
  verify2Fa,
  resend2Fa,
  forgotPassword,
} from "../../services/AuthService";
import { lockSeats } from "../../services/SeatService";
import {
  getPendingBooking,
  clearPendingBooking,
} from "../../utils/pendingBooking";
import { useAuth } from "../../utils/AuthContext";
import { toast } from "react-toastify";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectQuery = searchParams?.get("redirect");
  const { user, setUser, loading } = useAuth();
  const [isSecuringSeats, setIsSecuringSeats] = useState(false);

  // Mode: "LOGIN" | "2FA" | "FORGOT_PASSWORD"
  const [authMode, setAuthMode] = useState("LOGIN");

  // Login form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lockoutInfo, setLockoutInfo] = useState(null);

  // 2FA Challenge state
  const [twoFaChallenge, setTwoFaChallenge] = useState({
    challengeToken: "",
    channel: "EMAIL",
    maskedDestination: "",
  });
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes countdown
  const [resendCooldown, setResendCooldown] = useState(60); // 60s cooldown
  const [isVerifying2Fa, setIsVerifying2Fa] = useState(false);
  const [isResending2Fa, setIsResending2Fa] = useState(false);
  const otpInputRefs = useRef([]);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [isSendingForgot, setIsSendingForgot] = useState(false);

  const getDashboardRoute = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "/admin-dashboard";
      case "theatre manager":
      case "theatre_manager":
      case "theatremanager":
        return "/theatre-manager-dashboard";
      case "organizer":
        return "/organizer-dashboard";
      default:
        return "/user-dashboard";
    }
  };

  const handlePostAuthSuccess = useCallback(
    async (userData) => {
      // 1. Check for valid, non-expired enataka_pending_booking
      const pending = getPendingBooking();
      if (pending && pending.showId && pending.seatKeys && pending.seatKeys.length > 0) {
        setIsSecuringSeats(true);

        const activeSlot = pending.slotId || null;
        const targetNumericShowId = Number(pending.showId);
        const lockPayload = {
          showId: targetNumericShowId,
          seatIds: pending.seatKeys,
          seats: pending.seatKeys,
          userId: userData.id,
          showTimeSlot: activeSlot,
        };

        try {
          const res = await lockSeats(lockPayload);
          const lockData = res?.data || {};

          const bookingData = {
            showId: targetNumericShowId,
            seats:
              pending.seats && pending.seats.length > 0
                ? pending.seats
                : pending.seatKeys.map((k) => ({ seatIdentifier: k, price: 0 })),
            totalAmount: pending.totalAmount || 0,
            userId: userData.id,
            selectedTime: activeSlot,
            showTimeSlot: activeSlot,
            lockId: lockData.lockId,
            lockExpiresAt: lockData.lockExpiresAt,
          };

          if (typeof window !== "undefined") {
            sessionStorage.setItem("nataka_booking", JSON.stringify(bookingData));
          }
          clearPendingBooking();
          toast.success("Seats secured! Proceeding to checkout...");
          router.push("/checkout");
          return;
        } catch (err) {
          console.warn("Post-auth lock error in login:", err);
          clearPendingBooking();

          if (err.response?.status === 409 || err.response?.status === 400) {
            toast.error(
              "One or more selected seats were just taken while you signed in. Please choose from the available seats."
            );
          } else {
            toast.error(err.response?.data?.message || "Failed to secure seats hold.");
          }
          router.push(pending.returnPath || `/show/${targetNumericShowId}/seats`);
          return;
        } finally {
          setIsSecuringSeats(false);
        }
      }

      // 2. Check for redirect query parameter
      if (redirectQuery) {
        router.push(redirectQuery);
        return;
      }

      // 3. Fallback to role-based dashboard
      router.push(getDashboardRoute(userData.role));
    },
    [redirectQuery, router]
  );

  useEffect(() => {
    if (!loading && user) {
      handlePostAuthSuccess(user);
    }
  }, [user, loading, handlePostAuthSuccess]);

  // OTP Timers
  useEffect(() => {
    let interval = null;
    if (authMode === "2FA" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, otpTimer]);

  useEffect(() => {
    let interval = null;
    if (authMode === "2FA" && resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
    if (lockoutInfo) setLockoutInfo(null);
  };

  // Submit standard credentials
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setLockoutInfo(null);

    try {
      const response = await login(formData.email.trim(), formData.password);
      const data = response.data;

      // Check if 2FA challenge is required
      if (data?.requires2fa) {
        setTwoFaChallenge({
          challengeToken: data.challengeToken,
          channel: data.channel || "EMAIL",
          maskedDestination: data.maskedDestination || formData.email,
        });
        setOtpDigits(["", "", "", "", "", ""]);
        setOtpTimer(300);
        setResendCooldown(60);
        setAuthMode("2FA");
        toast.info(
          `Security verification code sent via ${data.channel || "Email"}.`
        );
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
        return;
      }

      // 2FA not enabled: complete sign in
      if (data) {
        if (typeof window !== "undefined") {
          localStorage.setItem("nataka_logged_in", "true");
        }
        setUser(data);
        toast.success(`Welcome back, ${data.fname || "Customer"}!`);
        handlePostAuthSuccess(data);
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 423) {
        // Account Temporarily Locked after 5 attempts
        const lockMsg =
          err.response?.data?.message ||
          "Account temporarily locked after 5 failed attempts. We've sent an instant unlock link to your registered email.";
        setLockoutInfo({
          message: lockMsg,
          remainingMinutes: err.response?.data?.remainingMinutes || 30,
        });
      } else if (err.response?.status === 429) {
        setErrorMessage(
          err.response?.data?.message ||
            "Too many requests. Please wait a moment."
        );
      } else if (err.response?.status === 401) {
        setErrorMessage("Invalid email or password. Please try again.");
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage(
          "Could not sign in. Please verify your internet connection."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 6-digit OTP input changes
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, "");
    if (!cleanVal) {
      const nextDigits = [...otpDigits];
      nextDigits[index] = "";
      setOtpDigits(nextDigits);
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = cleanVal.slice(-1);
    setOtpDigits(nextDigits);
    setErrorMessage("");

    // Auto-advance
    if (index < 5 && cleanVal) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    const completeOtp = nextDigits.join("");
    if (completeOtp.length === 6) {
      submit2FaVerification(completeOtp);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;

    const nextDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      nextDigits[i] = pasted[i];
    }
    setOtpDigits(nextDigits);
    setErrorMessage("");

    if (pasted.length === 6) {
      submit2FaVerification(pasted);
    } else {
      otpInputRefs.current[pasted.length]?.focus();
    }
  };

  // Submit 2FA verification
  const submit2FaVerification = async (codeToVerify) => {
    const code = codeToVerify || otpDigits.join("");
    if (code.length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifying2Fa(true);
    setErrorMessage("");

    try {
      const res = await verify2Fa(twoFaChallenge.challengeToken, code);
      const userData = res.data;

      if (userData) {
        if (typeof window !== "undefined") {
          localStorage.setItem("nataka_logged_in", "true");
        }
        setUser(userData);
        toast.success(`Security verification complete! Welcome, ${userData.fname || "Customer"}.`);
        handlePostAuthSuccess(userData);
      }
    } catch (err) {
      console.error("2FA Verification error:", err);
      const msg = err.response?.data?.message || "Invalid or expired verification code.";
      setErrorMessage(msg);
      setOtpDigits(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsVerifying2Fa(false);
    }
  };

  // Resend 2FA OTP
  const handleResend2Fa = async () => {
    if (resendCooldown > 0 || isResending2Fa) return;
    setIsResending2Fa(true);
    setErrorMessage("");

    try {
      await resend2Fa(twoFaChallenge.challengeToken);
      setResendCooldown(60);
      setOtpTimer(300);
      setOtpDigits(["", "", "", "", "", ""]);
      toast.success("A fresh 6-digit verification code has been dispatched!");
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending2Fa(false);
    }
  };

  // Forgot Password request
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsSendingForgot(true);
    setErrorMessage("");

    try {
      await forgotPassword(forgotEmail.trim());
      setForgotSubmitted(true);
      toast.success("Password reset instructions have been sent to your email.");
    } catch {
      toast.error("Failed to process request. Please try again.");
    } finally {
      setIsSendingForgot(false);
    }
  };

  const googleAuthUrl =
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL ||
    "https://server-nataka.chathurakavindu.me/oauth2/authorization/google";

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <ModernHeader />

      <main className="min-h-[82vh] bg-slate-50 dark:bg-[#0d0d12] flex items-center justify-center p-4 py-16 relative overflow-hidden transition-colors duration-200">
        {/* Securing Seats Overlay */}
        {isSecuringSeats && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="bg-white dark:bg-[#12121c] p-6 rounded-3xl border border-amber-500/30 shadow-2xl text-center max-w-sm">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Securing your seats...</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Holding your seats in real-time and initiating checkout.</p>
            </div>
          </div>
        )}

        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 dark:bg-red-900/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-white/15 shadow-xl dark:shadow-2xl relative z-10 bg-white/95 dark:bg-[#12121b]/90">
          {/* Logo & Headline */}
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

            {authMode === "LOGIN" && (
              <>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  Welcome Back
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Sign in to manage your stage drama bookings and tickets
                </p>
              </>
            )}

            {authMode === "2FA" && (
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mx-auto flex items-center justify-center mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  Two-Factor Authentication
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Enter the 6-digit code sent to{" "}
                  <strong className="text-amber-600 dark:text-amber-400 font-mono">
                    {twoFaChallenge.maskedDestination}
                  </strong>
                </p>
              </>
            )}

            {authMode === "FORGOT_PASSWORD" && (
              <>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  Reset Password
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Enter your account email to receive a secure password reset link
                </p>
              </>
            )}
          </div>

          {/* 1. LOCKOUT BANNER (ISO 27001 Annex A 5.17 / 5 Failed Attempts) */}
          {lockoutInfo && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-100">
                <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Account Temporarily Locked</span>
              </div>
              <p className="leading-relaxed">{lockoutInfo.message}</p>
              <div className="pt-2 border-t border-rose-200 dark:border-rose-800/40 text-[11px] text-rose-700 dark:text-rose-300">
                Check your inbox for our <strong>Security Alert Email</strong> containing your one-click unlock link, or wait for the automatic timeout.
              </div>
            </div>
          )}

          {/* 2. ERROR BANNER */}
          {errorMessage && !lockoutInfo && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-500/40 text-xs text-red-700 dark:text-red-200 leading-snug">
              {errorMessage}
            </div>
          )}

          {/* 3. MODE: STANDARD LOGIN FORM */}
          {authMode === "LOGIN" && (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="e.g. kasun@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("FORGOT_PASSWORD");
                        setForgotEmail(formData.email);
                        setErrorMessage("");
                      }}
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-theatre-gold w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 mt-2 shadow-lg shadow-amber-500/25 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                </div>
                <span className="relative bg-white dark:bg-[#12121b] px-3 text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">
                  Or continue with
                </span>
              </div>

              {/* Google OAuth Button */}
              <a
                href={googleAuthUrl}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white dark:hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-3 transition-colors border border-slate-200 dark:border-transparent shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </a>

              {/* Footer note */}
              <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6">
                Don't have an account yet?{" "}
                <Link
                  href="/register"
                  className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </>
          )}

          {/* 4. MODE: 2FA CHALLENGE OTP SCREEN */}
          {authMode === "2FA" && (
            <div className="space-y-6">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181824] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Code expires in:
                </span>
                <span
                  className={`font-mono font-bold ${
                    otpTimer < 60 ? "text-rose-500 animate-pulse" : "text-amber-500"
                  }`}
                >
                  {formatTimer(otpTimer)}
                </span>
              </div>

              {/* 6 Digit Inputs */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 text-center">
                  Enter 6-Digit One-Time Password
                </label>
                <div
                  className="flex justify-between gap-2"
                  onPaste={handleOtpPaste}
                >
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      disabled={isVerifying2Fa || otpTimer === 0}
                      className="w-12 h-14 text-center text-xl font-mono font-bold bg-slate-50 dark:bg-[#181824] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/15 focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={() => submit2FaVerification()}
                disabled={isVerifying2Fa || otpDigits.join("").length < 6 || otpTimer === 0}
                className="btn-theatre-gold w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer disabled:opacity-50"
              >
                {isVerifying2Fa ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Complete Sign In</span>
                  </>
                )}
              </button>

              {/* Resend & Back actions */}
              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("LOGIN");
                    setErrorMessage("");
                  }}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={handleResend2Fa}
                  disabled={resendCooldown > 0 || isResending2Fa}
                  className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:underline font-semibold disabled:opacity-40 disabled:no-underline"
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 ${isResending2Fa ? "animate-spin" : ""}`}
                  />
                  <span>
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Code"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 5. MODE: FORGOT PASSWORD FORM */}
          {authMode === "FORGOT_PASSWORD" && (
            <div className="space-y-4">
              {forgotSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs space-y-3 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                    Reset Link Dispatched
                  </p>
                  <p className="leading-relaxed text-[11px]">
                    If an account matches <strong>{forgotEmail}</strong>, we have sent a 15-minute secure password reset link. Please check your inbox and spam folder.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("LOGIN");
                      setForgotSubmitted(false);
                    }}
                    className="btn-theatre-gold w-full py-2.5 rounded-xl font-bold text-xs"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Account Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. kasun@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingForgot}
                    className="btn-theatre-gold w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingForgot ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Reset Link...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Send Password Reset Link</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode("LOGIN")}
                      className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      <ModernFooter />
    </>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#0b0b10]" />}>
      <LoginContent />
    </React.Suspense>
  );
}
