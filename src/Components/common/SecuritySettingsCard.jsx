"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  Smartphone,
  AlertTriangle,
  RotateCw,
  X,
  Check,
} from "lucide-react";
import {
  changePassword,
  initiate2FaSetup,
  confirm2FaSetup,
  disable2Fa,
} from "../../services/AuthService";
import { useAuth } from "../../utils/AuthContext";
import { toast } from "react-toastify";

export default function SecuritySettingsCard() {
  const { user, setUser } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // 2FA state
  const [selectedChannel, setSelectedChannel] = useState(
    user?.twoFactorChannel === "SMS" ? "SMS" : "EMAIL"
  );
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [setupStep, setSetupStep] = useState("INITIATE"); // "INITIATE" | "VERIFY"
  const [challengeToken, setChallengeToken] = useState("");
  const [maskedDest, setMaskedDest] = useState("");
  const [setupOtp, setSetupOtp] = useState(["", "", "", "", "", ""]);
  const [setupLoading, setSetupLoading] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);

  // Password criteria check
  const criteria = {
    length: newPassword.length >= 10,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    digit: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
  };
  const passedCriteriaCount = Object.values(criteria).filter(Boolean).length;
  const isPasswordValid =
    passedCriteriaCount === 5 &&
    newPassword === confirmPassword &&
    confirmPassword.length > 0 &&
    currentPassword.length > 0;

  // Handle password change submit
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setChangingPassword(true);
    setPasswordError("");

    try {
      const res = await changePassword(currentPassword, newPassword, confirmPassword);
      toast.success(res.data?.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Change password error:", err);
      setPasswordError(
        err.response?.data?.message || "Failed to update password. Please check your credentials."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // 2FA: Initiate Setup
  const handleStartSetup = async () => {
    setSetupLoading(true);
    try {
      const res = await initiate2FaSetup(selectedChannel);
      setChallengeToken(res.data?.challengeToken);
      setMaskedDest(res.data?.maskedDestination || "your registered address");
      setSetupStep("VERIFY");
      setSetupOtp(["", "", "", "", "", ""]);
      toast.info(`Verification code sent to ${res.data?.maskedDestination || selectedChannel}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate 2FA setup.");
    } finally {
      setSetupLoading(false);
    }
  };

  // 2FA: Confirm OTP
  const handleConfirmSetup = async () => {
    const code = setupOtp.join("");
    if (code.length < 6) {
      toast.warn("Please enter all 6 digits of the verification code.");
      return;
    }

    setSetupLoading(true);
    try {
      const res = await confirm2FaSetup(challengeToken, code);
      if (res.data) {
        setUser({ ...user, ...res.data, twoFactorEnabled: true, twoFactorChannel: selectedChannel });
      }
      toast.success(`Two-Factor Authentication is now active via ${selectedChannel}!`);
      setSetupModalOpen(false);
      setSetupStep("INITIATE");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid verification code.");
    } finally {
      setSetupLoading(false);
    }
  };

  // 2FA: Disable
  const handleDisable2Fa = async () => {
    if (!disablePassword) {
      toast.warn("Please enter your password to disable 2FA.");
      return;
    }

    setDisableLoading(true);
    try {
      const res = await disable2Fa(disablePassword);
      if (res.data) {
        setUser({ ...user, ...res.data, twoFactorEnabled: false, twoFactorChannel: "NONE" });
      }
      toast.success("Two-Factor Authentication has been disabled.");
      setDisableModalOpen(false);
      setDisablePassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to disable 2FA. Incorrect password.");
    } finally {
      setDisableLoading(false);
    }
  };

  const handleOtpInput = (idx, val) => {
    const clean = val.replace(/[^0-9]/g, "");
    const next = [...setupOtp];
    next[idx] = clean.slice(-1);
    setSetupOtp(next);

    if (clean && idx < 5) {
      const nextEl = document.getElementById(`setup-otp-${idx + 1}`);
      if (nextEl) nextEl.focus();
    }
  };

  const is2FaActive = !!user?.twoFactorEnabled;

  return (
    <div className="space-y-6">
      {/* 1. Two-Factor Authentication Card */}
      <div className="bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Two-Factor Authentication (2FA)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enhance your account defense with 6-digit one-time passcodes on every sign in
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {is2FaActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active via {user.twoFactorChannel || "Email"}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                <span>Disabled (Optional)</span>
              </span>
            )}
          </div>
        </div>

        {/* Action area */}
        {is2FaActive ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 text-xs">
            <div className="space-y-1 text-slate-700 dark:text-slate-300">
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                Your account is currently protected by 2FA.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                A verification code is dispatched to your registered {user.twoFactorChannel === "SMS" ? "mobile number" : "email address"} whenever you sign in.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDisableModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 font-bold transition-all text-xs shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Disable 2FA
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email Option */}
              <label
                onClick={() => setSelectedChannel("EMAIL")}
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  selectedChannel === "EMAIL"
                    ? "bg-amber-500/10 border-amber-500/50 text-slate-900 dark:text-white"
                    : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-white/20"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-amber-500 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold">Email OTP</p>
                  <p className="text-[10px] text-slate-500 truncate" title={user?.email}>
                    {user?.email || "Registered email address"}
                  </p>
                </div>
              </label>

              {/* SMS Option */}
              <label
                onClick={() => setSelectedChannel("SMS")}
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  selectedChannel === "SMS"
                    ? "bg-amber-500/10 border-amber-500/50 text-slate-900 dark:text-white"
                    : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-white/20"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-amber-500 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold">SMS OTP (Sri Lanka)</p>
                  <p className="text-[10px] text-slate-500 truncate" title={user?.phoneNumber || "Add phone in profile"}>
                    {user?.phoneNumber || "Requires registered mobile number"}
                  </p>
                </div>
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                setSetupModalOpen(true);
                setSetupStep("INITIATE");
              }}
              className="btn-theatre-gold px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enable 2FA via {selectedChannel}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Change Password Card */}
      <div className="bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Change Account Password
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user?.role === "Admin"
                ? "ISO/IEC 27001 Annex A 5.17 password protection with non-reuse enforcement"
                : "Secure password protection to keep your tickets and bookings safe"}
            </p>
          </div>
        </div>

        {passwordError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-500/40 text-xs text-red-700 dark:text-red-200 leading-snug">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none pr-10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New & Confirm Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 10 characters"
                  className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none pr-10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none pr-10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Strength Meter */}
          {newPassword && (
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <span className={criteria.length ? "text-emerald-500" : "text-slate-400"}>
                  {criteria.length ? "✓" : "•"} 10+ Characters
                </span>
                <span className={criteria.uppercase ? "text-emerald-500" : "text-slate-400"}>
                  {criteria.uppercase ? "✓" : "•"} Uppercase (A-Z)
                </span>
                <span className={criteria.lowercase ? "text-emerald-500" : "text-slate-400"}>
                  {criteria.lowercase ? "✓" : "•"} Lowercase (a-z)
                </span>
                <span className={criteria.digit ? "text-emerald-500" : "text-slate-400"}>
                  {criteria.digit ? "✓" : "•"} Number (0-9)
                </span>
                <span className={criteria.special ? "text-emerald-500" : "text-slate-400"}>
                  {criteria.special ? "✓" : "•"} Special (!@#$...)
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={changingPassword || !isPasswordValid}
            className="btn-theatre-gold px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {changingPassword ? (
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
      </div>

      {/* 2FA SETUP MODAL */}
      {setupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12121b] border border-slate-200 dark:border-white/15 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSetupModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {setupStep === "INITIATE" ? (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mx-auto flex items-center justify-center">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Activate {selectedChannel} 2FA
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  We will send a 6-digit verification code to your {selectedChannel === "SMS" ? "phone number" : "email address"} to prove deliverability.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartSetup}
                    disabled={setupLoading}
                    className="btn-theatre-gold w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                  >
                    {setupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Send Verification Code</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Enter Verification Code
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Sent to <strong className="text-amber-500 font-mono">{maskedDest}</strong>
                  </p>
                </div>

                <div className="flex justify-between gap-1.5 py-2">
                  {setupOtp.map((d, i) => (
                    <input
                      key={i}
                      id={`setup-otp-${i}`}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      value={d}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      className="w-10 h-12 text-center text-lg font-mono font-bold bg-slate-50 dark:bg-[#181824] rounded-xl border border-slate-200 dark:border-white/15 focus:border-amber-500 focus:outline-none"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleConfirmSetup}
                  disabled={setupLoading || setupOtp.join("").length < 6}
                  className="btn-theatre-gold w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {setupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Verify & Activate 2FA</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2FA DISABLE MODAL */}
      {disableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12121b] border border-slate-200 dark:border-white/15 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setDisableModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Disable Two-Factor Authentication?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                To protect against unauthorized changes, please enter your current account password.
              </p>
            </div>

            <div>
              <input
                type="password"
                required
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-rose-500 focus:outline-none transition-all"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDisableModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisable2Fa}
                disabled={disableLoading || !disablePassword}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50"
              >
                {disableLoading ? "Disabling..." : "Confirm Disable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
