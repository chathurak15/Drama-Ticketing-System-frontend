"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Ticket,
  ShieldCheck,
  Loader2,
  KeyRound,
  RotateCw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  login,
  verify2Fa,
  resend2Fa,
  register,
  forgotPassword,
} from "../services/AuthService";
import { useAuth } from "../utils/AuthContext";
import { toast } from "react-toastify";

/**
 * BookingAuthModal
 * Inline Checkout-Gate Authentication Modal that preserves pending booking intent.
 * Supports:
 * - Instant Tabs: "Sign In" and "Quick Create Account" (Buyer only)
 * - Seamless in-modal 2FA OTP challenge verification
 * - In-modal Forgot Password flow
 * - Live context banner showing held seat keys & total amount
 */
export default function BookingAuthModal({
  isOpen,
  onClose,
  selectedSeats = [],
  totalAmount = 0,
  onAuthSuccess,
  showTitle = "",
}) {
  const { setUser } = useAuth();

  // Active Tab: "SIGN_IN" | "REGISTER"
  const [activeTab, setActiveTab] = useState("SIGN_IN");

  // Sub-modes for Sign In tab: "LOGIN" | "2FA" | "FORGOT_PASSWORD"
  const [authSubMode, setAuthSubMode] = useState("LOGIN");

  // Sign In state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // 2FA state
  const [twoFaChallenge, setTwoFaChallenge] = useState({
    challengeToken: "",
    channel: "EMAIL",
    maskedDestination: "",
  });
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isVerifying2Fa, setIsVerifying2Fa] = useState(false);
  const [isResending2Fa, setIsResending2Fa] = useState(false);
  const otpInputRefs = useRef([]);

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Quick Register state (Buyer / Customer only)
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [registerErrors, setRegisterErrors] = useState({});
  const [registerLoading, setRegisterLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAuthSubMode("LOGIN");
      setLoginError("");
      setRegisterErrors({});
      setForgotSent(false);
    }
  }, [isOpen]);

  // 2FA timers
  useEffect(() => {
    let interval = null;
    if (isOpen && authSubMode === "2FA" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, authSubMode, otpTimer]);

  useEffect(() => {
    let interval = null;
    if (isOpen && authSubMode === "2FA" && resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, authSubMode, resendCooldown]);

  if (!isOpen) return null;

  // Format context banner
  const seatCount = selectedSeats.length;
  const seatKeysStr = selectedSeats
    .map((s) => (typeof s === "string" ? s : s.seatIdentifier || s.id || ""))
    .filter(Boolean)
    .join(", ");
  const formattedAmount = Number(totalAmount || 0).toLocaleString();

  // ----------------------------------------------------
  // Sign In Handler
  // ----------------------------------------------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("Please enter both email and password.");
      return;
    }

    setLoginLoading(true);

    try {
      const response = await login(loginEmail.trim(), loginPassword);
      const data = response.data;

      // Handle 2FA Challenge requirement
      if (data && data.requires2fa) {
        setTwoFaChallenge({
          challengeToken: data.challengeToken,
          channel: data.channel || "EMAIL",
          maskedDestination: data.maskedDestination || loginEmail.trim(),
        });
        setOtpDigits(["", "", "", "", "", ""]);
        setOtpTimer(300);
        setResendCooldown(60);
        setAuthSubMode("2FA");
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
        return;
      }

      // Successful Direct Login (No 2FA)
      if (data) {
        if (typeof window !== "undefined") {
          localStorage.setItem("nataka_logged_in", "true");
        }
        setUser(data);
        toast.success(`Welcome back, ${data.fname || "Customer"}!`);
        if (onAuthSuccess) {
          onAuthSuccess(data);
        }
      }
    } catch (err) {
      console.error("Modal login error:", err);
      if (err.response?.status === 423) {
        setLoginError(
          err.response?.data?.message ||
            "Account temporarily locked due to multiple failed attempts. Please check your email for an unlock link."
        );
      } else if (err.response?.status === 401) {
        setLoginError("Invalid email or password. Please try again.");
      } else if (err.response?.data?.message) {
        setLoginError(err.response.data.message);
      } else {
        setLoginError("Could not sign in. Please verify your connection.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // ----------------------------------------------------
  // 2FA OTP Handlers
  // ----------------------------------------------------
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, "");
    if (!cleanVal) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    const next = [...otpDigits];
    next[index] = cleanVal.slice(-1);
    setOtpDigits(next);
    setLoginError("");

    if (index < 5 && cleanVal) {
      otpInputRefs.current[index + 1]?.focus();
    }

    const completeOtp = next.join("");
    if (completeOtp.length === 6) {
      submit2Fa(completeOtp);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    if (!pasted) return;

    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtpDigits(next);

    if (pasted.length === 6) {
      submit2Fa(pasted);
    } else {
      otpInputRefs.current[pasted.length]?.focus();
    }
  };

  const submit2Fa = async (codeToVerify) => {
    const code = codeToVerify || otpDigits.join("");
    if (code.length < 6) {
      setLoginError("Please enter the complete 6-digit code.");
      return;
    }

    setIsVerifying2Fa(true);
    setLoginError("");

    try {
      const res = await verify2Fa(twoFaChallenge.challengeToken, code);
      const userData = res.data;

      if (userData) {
        if (typeof window !== "undefined") {
          localStorage.setItem("nataka_logged_in", "true");
        }
        setUser(userData);
        toast.success(`Verification complete! Welcome, ${userData.fname || "Customer"}.`);
        if (onAuthSuccess) {
          onAuthSuccess(userData);
        }
      }
    } catch (err) {
      console.error("2FA Verification error:", err);
      setLoginError(err.response?.data?.message || "Invalid or expired verification code.");
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } finally {
      setIsVerifying2Fa(false);
    }
  };

  const handleResend2Fa = async () => {
    if (resendCooldown > 0 || isResending2Fa) return;
    setIsResending2Fa(true);
    setLoginError("");

    try {
      const res = await resend2Fa(twoFaChallenge.challengeToken);
      if (res?.data?.challengeToken) {
        setTwoFaChallenge((prev) => ({
          ...prev,
          challengeToken: res.data.challengeToken,
        }));
      }
      setResendCooldown(60);
      setOtpTimer(300);
      setOtpDigits(["", "", "", "", "", ""]);
      toast.info("A new 6-digit security code has been sent.");
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      console.error("Resend 2FA error:", err);
      setLoginError("Failed to resend code. Please try again.");
    } finally {
      setIsResending2Fa(false);
    }
  };

  // ----------------------------------------------------
  // Forgot Password Handler
  // ----------------------------------------------------
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setLoginError("Please enter your registered email address.");
      return;
    }
    setForgotLoading(true);
    setLoginError("");

    try {
      await forgotPassword(forgotEmail.trim().toLowerCase());
      setForgotSent(true);
      toast.success("Password reset instructions sent to your email.");
    } catch (err) {
      console.error("Forgot password error:", err);
      setLoginError(err.response?.data?.message || "Could not process request. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  // ----------------------------------------------------
  // Quick Register Handler (Buyer / Customer only)
  // ----------------------------------------------------
  const validateRegister = () => {
    const errs = {};
    if (!registerData.firstName.trim()) errs.firstName = "First name is required";
    if (!registerData.lastName.trim()) errs.lastName = "Last name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!registerData.email.trim() || !emailRegex.test(registerData.email)) {
      errs.email = "Valid email is required";
    }

    const slMobileRegex = /^(0|94|\+94)?[0-9]{9}$/;
    if (!registerData.mobileNumber.trim() || !slMobileRegex.test(registerData.mobileNumber.replace(/\s/g, ""))) {
      errs.mobileNumber = "Enter a valid Sri Lankan mobile (e.g. 0771234567)";
    }

    if (!registerData.password || registerData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    if (registerData.password !== registerData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    setRegisterErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setRegisterLoading(true);

    try {
      const payload = {
        fname: registerData.firstName.trim(),
        lname: registerData.lastName.trim(),
        email: registerData.email.trim().toLowerCase(),
        phoneNumber: registerData.mobileNumber.trim(),
        password: registerData.password,
        image: "",
        role: "Customer", // Buyer account only
      };

      await register(payload);
      toast.success("Account created successfully!");

      // Seamlessly log the user in immediately without prompting them to sign in manually
      try {
        const loginRes = await login(payload.email, payload.password);
        const data = loginRes.data;

        if (data && data.requires2fa) {
          setTwoFaChallenge({
            challengeToken: data.challengeToken,
            channel: data.channel || "EMAIL",
            maskedDestination: data.maskedDestination || payload.email,
          });
          setActiveTab("SIGN_IN");
          setAuthSubMode("2FA");
          setOtpDigits(["", "", "", "", "", ""]);
          return;
        }

        if (data) {
          if (typeof window !== "undefined") {
            localStorage.setItem("nataka_logged_in", "true");
          }
          setUser(data);
          toast.success(`Welcome, ${data.fname || "Customer"}!`);
          if (onAuthSuccess) {
            onAuthSuccess(data);
          }
        }
      } catch {
        // Fallback: switch to sign in tab pre-populated
        setActiveTab("SIGN_IN");
        setAuthSubMode("LOGIN");
        setLoginEmail(payload.email);
        toast.info("Please enter your password to sign in.");
      }
    } catch (err) {
      console.error("Quick registration error:", err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not create account. Please check your details."
      );
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#12121c] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden relative my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Context Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/20 to-amber-600/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Ticket className="w-3.5 h-3.5" />
            </span>
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 truncate">
              Sign in to hold your {seatCount} seat{seatCount > 1 ? "s" : ""} (
              <span className="font-bold">{seatKeysStr || "Selected"}</span>) • LKR {formattedAmount}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (Sign In vs Quick Register) - Hidden in 2FA/Forgot modes */}
        {authSubMode === "LOGIN" && (
          <div className="flex border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-black/20">
            <button
              type="button"
              onClick={() => {
                setActiveTab("SIGN_IN");
                setLoginError("");
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === "SIGN_IN"
                  ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-[#12121c]"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("REGISTER");
                setRegisterErrors({});
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === "REGISTER"
                  ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-[#12121c]"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Quick Create Account
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {/* ======================================================== */}
          {/* TAB 1: SIGN IN FLOW                                      */}
          {/* ======================================================== */}
          {activeTab === "SIGN_IN" && authSubMode === "LOGIN" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Welcome to Naataka.LK
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sign in to hold your seats {showTitle ? `for ${showTitle} ` : ""}with a 10-minute priority lock.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setAuthSubMode("FORGOT_PASSWORD");
                      setLoginError("");
                    }}
                    className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in & securing seats...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In & Hold Seats</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 1 SUB-MODE: 2FA OTP VERIFICATION                     */}
          {/* ======================================================== */}
          {activeTab === "SIGN_IN" && authSubMode === "2FA" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setAuthSubMode("LOGIN");
                  setLoginError("");
                }}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to password</span>
              </button>

              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-2 text-amber-500">
                  <KeyRound className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Two-Factor Authentication
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Enter the 6-digit code sent to your{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {twoFaChallenge.channel || "Email"}
                  </strong>{" "}
                  ({twoFaChallenge.maskedDestination})
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* 6-Digit OTP inputs */}
              <div className="flex justify-center gap-2 sm:gap-2.5 my-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                ))}
              </div>

              {/* Countdown and Resend */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span>
                  Code expires in:{" "}
                  <strong className="text-amber-600 dark:text-amber-400 font-mono font-bold">
                    {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, "0")}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={handleResend2Fa}
                  disabled={resendCooldown > 0 || isResending2Fa}
                  className="font-semibold text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCw className={`w-3 h-3 ${isResending2Fa ? "animate-spin" : ""}`} />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => submit2Fa()}
                disabled={isVerifying2Fa || otpDigits.join("").length < 6}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isVerifying2Fa ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying code & locking seats...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Continue Booking</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1 SUB-MODE: FORGOT PASSWORD                          */}
          {/* ======================================================== */}
          {activeTab === "SIGN_IN" && authSubMode === "FORGOT_PASSWORD" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setAuthSubMode("LOGIN");
                  setLoginError("");
                }}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </button>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Reset Password
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter your email address and we'll send you an instant reset link.
                </p>
              </div>

              {forgotSent ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500" />
                  <p className="font-semibold">Reset instructions sent!</p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Please check your inbox at <strong>{forgotEmail}</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {loginError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                      {loginError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-amber-500 hover:bg-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: QUICK CREATE ACCOUNT (Buyer / Customer only)     */}
          {/* ======================================================== */}
          {activeTab === "REGISTER" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Quick Create Account
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete this quick form to receive your QR e-ticket and booking receipts.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={registerData.firstName}
                    onChange={(e) =>
                      setRegisterData((p) => ({ ...p, firstName: e.target.value }))
                    }
                    placeholder="Chathura"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                  {registerErrors.firstName && (
                    <p className="text-[10px] text-red-500 mt-0.5">{registerErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={registerData.lastName}
                    onChange={(e) =>
                      setRegisterData((p) => ({ ...p, lastName: e.target.value }))
                    }
                    placeholder="Kavindu"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                  {registerErrors.lastName && (
                    <p className="text-[10px] text-red-500 mt-0.5">{registerErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                {registerErrors.email && (
                  <p className="text-[10px] text-red-500 mt-0.5">{registerErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sri Lankan Mobile Number{" "}
                  <span className="text-[10px] text-slate-400 font-normal">
                    (for SMS e-tickets)
                  </span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={registerData.mobileNumber}
                    onChange={(e) =>
                      setRegisterData((p) => ({ ...p, mobileNumber: e.target.value }))
                    }
                    placeholder="07XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                {registerErrors.mobileNumber && (
                  <p className="text-[10px] text-red-500 mt-0.5">{registerErrors.mobileNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData((p) => ({ ...p, password: e.target.value }))
                      }
                      placeholder="Min 6 chars"
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {registerErrors.password && (
                    <p className="text-[10px] text-red-500 mt-0.5">{registerErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData((p) => ({ ...p, confirmPassword: e.target.value }))
                      }
                      placeholder="Repeat password"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {registerErrors.confirmPassword && (
                    <p className="text-[10px] text-red-500 mt-0.5">
                      {registerErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {registerLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating account & securing seats...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Create Account & Hold Seats</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
