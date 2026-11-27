"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Smartphone,
  History,
  Clock,
  Globe,
  Save,
  Check,
  X,
} from "lucide-react";
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
} from "../../services/UserService";
import {
  initiate2FaSetup,
  confirm2FaSetup,
  disable2Fa,
  changePassword,
} from "../../services/AuthService";
import { useAuth } from "../../utils/AuthContext";
import { toast } from "react-toastify";

const ROLE_LABELS = {
  Customer: "Buyer (Ticket Customer)",
  Organizer: "Drama Producer / Organizer",
  TheatreManager: "Theatre / Venue Manager",
  Admin: "Platform Administrator",
};

export default function ProfileAndSecurityContent({ embedded = false }) {
  const { user: authUser, setUser: setAuthUser } = useAuth();

  // Profile State
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const [formProfile, setFormProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // 2FA State
  const [twoFaChannel, setTwoFaChannel] = useState("EMAIL");
  const [initiating2Fa, setInitiating2Fa] = useState(false);
  const [twoFaChallenge, setTwoFaChallenge] = useState(null);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [confirming2Fa, setConfirming2Fa] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableOtp, setDisableOtp] = useState("");
  const [disabling2Fa, setDisabling2Fa] = useState(false);
  const otpInputRefs = useRef([]);

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await getMyProfile();
      const data = res.data;
      setProfile(data);
      setFormProfile({
        firstName: data.firstName || data.fname || "",
        lastName: data.lastName || data.lname || "",
        phone: data.phone || data.phoneNumber || "",
      });
      if (data.twoFactorChannel && data.twoFactorChannel !== "NONE") {
        setTwoFaChannel(data.twoFactorChannel);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error(err.response?.data?.message || "Could not load user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // --- Profile Handlers ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formProfile.firstName.trim()) {
      toast.warn("First name cannot be empty");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await updateMyProfile({
        firstName: formProfile.firstName.trim(),
        lastName: formProfile.lastName.trim(),
        phone: formProfile.phone.trim(),
      });
      setProfile(res.data);
      if (authUser && setAuthUser) {
        setAuthUser({
          ...authUser,
          fname: res.data.firstName || res.data.fname,
          lname: res.data.lastName || res.data.lname,
          phoneNumber: res.data.phone || res.data.phoneNumber,
        });
      }
      toast.success("Profile details updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(err.response?.data?.message || "Failed to save profile changes");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warn("Please select an image file (JPEG, PNG, or WebP)");
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await uploadAvatar(file);
      const newUrl = res.data?.avatarUrl || res.data?.image;
      setProfile((prev) => ({ ...prev, avatarUrl: newUrl, image: newUrl }));
      if (authUser && setAuthUser) {
        setAuthUser({ ...authUser, avatarUrl: newUrl, image: newUrl });
      }
      toast.success("Profile photo updated successfully!");
    } catch (err) {
      console.error("Avatar upload failed:", err);
      toast.error(err.response?.data?.message || "Failed to upload profile photo");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // --- 2FA Handlers ---
  const handleInitiate2Fa = async () => {
    setInitiating2Fa(true);
    try {
      const res = await initiate2FaSetup(twoFaChannel);
      setTwoFaChallenge(res.data);
      setOtpDigits(["", "", "", "", "", ""]);
      toast.info(`Verification code sent to your ${twoFaChannel === "SMS" ? "mobile number" : "email address"}.`);
    } catch (err) {
      console.error("2FA setup initiation failed:", err);
      toast.error(err.response?.data?.message || "Could not send verification code");
    } finally {
      setInitiating2Fa(false);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleConfirm2Fa = async () => {
    const code = otpDigits.join("");
    if (code.length !== 6) {
      toast.warn("Please enter all 6 digits of the verification code");
      return;
    }
    setConfirming2Fa(true);
    try {
      await confirm2FaSetup(twoFaChallenge.challengeToken, code);
      toast.success("Two-Factor Authentication is now active on your account!");
      setTwoFaChallenge(null);
      fetchProfileData();
    } catch (err) {
      console.error("2FA confirmation failed:", err);
      toast.error(err.response?.data?.message || "Invalid or expired verification code");
    } finally {
      setConfirming2Fa(false);
    }
  };

  const handleDisable2Fa = async (e) => {
    e.preventDefault();
    if (!disablePassword) {
      toast.warn("Password is required to disable 2FA");
      return;
    }
    setDisabling2Fa(true);
    try {
      await disable2Fa(disablePassword, disableOtp || null);
      toast.success("Two-Factor Authentication disabled.");
      setShowDisableModal(false);
      setDisablePassword("");
      setDisableOtp("");
      fetchProfileData();
    } catch (err) {
      console.error("Failed to disable 2FA:", err);
      toast.error(err.response?.data?.message || "Incorrect password or OTP");
    } finally {
      setDisabling2Fa(false);
    }
  };

  // --- Password Handlers ---
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "Empty", color: "bg-slate-200 dark:bg-white/10" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500", text: "text-red-500" };
    if (score === 3) return { score, label: "Moderate", color: "bg-amber-500", text: "text-amber-500" };
    if (score === 4) return { score, label: "Good", color: "bg-sky-500", text: "text-sky-500" };
    return { score, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
  };

  const passwordStrength = calculatePasswordStrength(passwordForm.newPassword);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      toast.warn("Please enter your current password");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.warn("New password must be at least 8 characters long");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.warn("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      toast.success("Password changed successfully! A security notice has been emailed.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      fetchProfileData();
    } catch (err) {
      console.error("Failed to change password:", err);
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-medium">Loading profile & security settings...</p>
      </div>
    );
  }

  const roleName = profile?.role || authUser?.role || "Customer";
  const roleDisplay = ROLE_LABELS[roleName] || roleName;
  const avatarSrc = profile?.avatarUrl || profile?.image || authUser?.avatarUrl || authUser?.image;
  const isCustomer = roleName === "Customer" || roleName === "customer" || roleName === "Buyer" || !roleName;

  return (
    <div className={`space-y-6 ${embedded ? "" : "max-w-5xl mx-auto py-6 px-4"}`}>
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-amber-500" />
            <span>Profile & Account Security</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isCustomer
              ? "Manage your personal contact details, mobile verification, and account password security."
              : "Manage your personal contact details, ISO 27001 two-factor authentication, and password security."}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold">
            {roleDisplay}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD 1: Personal Information (Spans 2 cols on desktop) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#12121b]/90 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
            <User className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Personal Information
            </h2>
          </div>

          {/* Avatar & Photo Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-tr from-amber-600 to-red-600 border-2 border-amber-500/50 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Profile Photo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Uploaded to secure Cloudflare R2 storage. Recommended: Square PNG or JPG.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-black transition-colors shadow-sm cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{uploadingAvatar ? "Uploading..." : "Change Photo"}</span>
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formProfile.firstName}
                  onChange={(e) => setFormProfile({ ...formProfile, firstName: e.target.value })}
                  placeholder="Kasun"
                  className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formProfile.lastName}
                  onChange={(e) => setFormProfile({ ...formProfile, lastName: e.target.value })}
                  placeholder="Perera"
                  className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Read-only Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address (Primary Account Key)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="w-full bg-slate-100 dark:bg-white/5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 cursor-not-allowed"
                  />
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Email change requires verification by contacting platform support.
                </p>
              </div>

              {/* Editable Sri Lankan Mobile */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Sri Lankan Mobile Number
                  </label>
                  {profile?.phoneVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-semibold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Unverified</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={formProfile.phone}
                    onChange={(e) => setFormProfile({ ...formProfile, phone: e.target.value })}
                    placeholder="077 123 4567"
                    className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Format: 07XXXXXXXX or +947XXXXXXXX. Used for SMS OTPs and E-Tickets.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="btn-theatre-gold px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* User Summary Widget (1 col) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#12121b]/90 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Account Status
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <span className="text-slate-600 dark:text-slate-400">Account Standing</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{profile?.accountStatus || "ACTIVE"}</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <span className="text-slate-600 dark:text-slate-400">Two-Factor Authentication</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    profile?.twoFactorEnabled ? "text-emerald-500" : "text-amber-500"
                  }`}
                >
                  {profile?.twoFactorEnabled ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ON ({profile?.twoFactorChannel})</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Disabled</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <span className="text-slate-600 dark:text-slate-400">
                  {isCustomer ? "Account Protection" : "Brute-Force Guard"}
                </span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isCustomer ? "Safe Login Guard Active" : "5-Attempt Lockout Active"}</span>
                </span>
              </div>

              {profile?.lastLoginAt && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <span className="text-slate-600 dark:text-slate-400">Last Sign In</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {new Date(profile.lastLoginAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isCustomer ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-900 dark:text-emerald-300 leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>100% Secure Buyer Account</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Your personal details, Sri Lankan mobile number, and booking history are strictly protected with encrypted data security.
              </p>
              <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <span>🇱🇰 CBSL-Approved IPG & LankaPay Secure</span>
                <span>Islandwide Verified Venues</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong className="block font-bold mb-0.5">ISO/IEC 27001:2022 Certified</strong>
              All password hashes are salted with BCrypt (Cost 12). Tokens & OTPs are stored with SHA-256 cryptographic digest.
            </div>
          )}
        </div>
      </div>

      {/* CARD 2: Two-Factor Authentication (2FA) */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#12121b]/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isCustomer ? "Two-Step Login Verification (OTP)" : "Two-Factor Authentication (2FA OTP)"}
            </h2>
          </div>

          {/* Status Pill */}
          <div className="flex items-center gap-2">
            {profile?.twoFactorEnabled ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Active ({profile?.twoFactorChannel} OTP)</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Disabled (Recommended to Enable)</span>
              </span>
            )}
          </div>
        </div>

        {profile?.twoFactorEnabled ? (
          /* Active State & Deactivation */
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Your account is protected by Two-Factor Authentication</span>
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                A 6-digit one-time passcode will be required every time you sign in via{" "}
                <strong>{profile.twoFactorChannel}</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDisableModal(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shrink-0"
            >
              Disable 2FA
            </button>
          </div>
        ) : (
          /* Setup / Activation Flow */
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {isCustomer
                ? "Select how you would like to receive your 6-digit verification code (Email or Sri Lankan Mobile SMS):"
                : "Select your preferred channel to receive a 6-digit verification code every time you log in:"}
            </p>

            {/* Radio Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Email OTP */}
              <label
                onClick={() => setTwoFaChannel("EMAIL")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  twoFaChannel === "EMAIL"
                    ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10"
                    : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Email OTP
                    </span>
                    <input
                      type="radio"
                      name="twoFaChannel"
                      checked={twoFaChannel === "EMAIL"}
                      onChange={() => setTwoFaChannel("EMAIL")}
                      className="accent-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Sends a cryptographically random 6-digit code to{" "}
                    <strong>{profile?.email}</strong>. (Zero telecom delays).
                  </p>
                </div>
              </label>

              {/* Option 2: Sri Lankan SMS OTP */}
              <label
                onClick={() => setTwoFaChannel("SMS")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  twoFaChannel === "SMS"
                    ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10"
                    : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      SMS OTP (Sri Lankan Mobile)
                    </span>
                    <input
                      type="radio"
                      name="twoFaChannel"
                      checked={twoFaChannel === "SMS"}
                      onChange={() => setTwoFaChannel("SMS")}
                      className="accent-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Sends an instant SMS OTP to your registered phone{" "}
                    <strong>{formProfile.phone || profile?.phone || "No phone registered"}</strong>.
                  </p>
                </div>
              </label>
            </div>

            {/* Initiate Button / Step 1 */}
            {!twoFaChallenge && (
              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={handleInitiate2Fa}
                  disabled={initiating2Fa || (twoFaChannel === "SMS" && !formProfile.phone)}
                  className="btn-theatre-gold px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  {initiating2Fa ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Send Setup Verification Code</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2: Verification Code Input */}
            {twoFaChallenge && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4 animate-in fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>Enter the 6-Digit Code to Activate 2FA</span>
                    </h4>
                    <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                      Verification code dispatched to:{" "}
                      <strong>{twoFaChallenge.maskedDestination}</strong> (Valid for 5 minutes).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFaChallenge(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 py-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-white dark:bg-[#181824] text-slate-900 dark:text-white rounded-xl border border-amber-500/40 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none shadow-sm transition-all"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleInitiate2Fa}
                    disabled={initiating2Fa}
                    className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold"
                  >
                    Resend Code
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirm2Fa}
                    disabled={confirming2Fa || otpDigits.join("").length !== 6}
                    className="btn-theatre-gold px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {confirming2Fa ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirm & Enable 2FA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CARD 3: Password & Account Security + Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Password Form */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#12121b]/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
            <Key className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Change Password
            </h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            {/* Current Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Current Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showCurrentPass ? "text" : "password"}
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showNewPass ? "text" : "password"}
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Min 8 characters"
                  className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {passwordForm.newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Strength:</span>
                    <span className={`font-bold ${passwordStrength.text}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${passwordStrength.color}`}
                      style={{ width: `${Math.min(100, (passwordStrength.score / 5) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showNewPass ? "text" : "password"}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                  className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="btn-theatre-gold w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Recent Security Events Audit List */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#12121b]/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
            <History className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isCustomer ? "Recent Sign-In Activity" : "Recent Security Events (Audit Log)"}
            </h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isCustomer
              ? "A clear record of recent logins and password updates to ensure your ticket account is safe."
              : "Immutable log of recent authentication, 2FA, and password events for your account per ISO/IEC 27001 Annex A 8.15."}
          </p>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {profile?.recentSecurityEvents && profile.recentSecurityEvents.length > 0 ? (
              profile.recentSecurityEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {evt.eventType.replace(/_/g, " ")}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {evt.metadata || "Authentication activity logged"}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{evt.ipAddress || "Localhost"}</span>
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">
                    {evt.createdAt ? new Date(evt.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "Recent"}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center p-8 text-xs text-slate-500 dark:text-slate-400">
                No recent security incidents logged.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sri Lankan Customer Help & Support Card for Buyer */}
      {isCustomer && (
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Need Help with Your Account or Drama Tickets?
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Our Sri Lankan support team is here to assist you in Sinhala and English (9:00 AM – 8:00 PM).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://wa.me/94741550909"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>WhatsApp: +94 74 155 0909</span>
            </a>
            <a
              href="mailto:admin@zeylex.com"
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold text-xs border border-slate-200 dark:border-white/10 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      )}

      {/* DISABLE 2FA CONFIRMATION MODAL */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-slate-200 dark:border-white/20 bg-white dark:bg-[#151522] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Disable Two-Factor Authentication
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDisableModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Disabling 2FA reduces your account security. Please enter your current account password to confirm this action.
            </p>

            <form onSubmit={handleDisable2Fa} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDisableModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disabling2Fa}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {disabling2Fa ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Disabling...</span>
                    </>
                  ) : (
                    <span>Confirm Disable 2FA</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
