"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
} from "lucide-react";
import { register } from "../../services/AuthService";
import { toast } from "react-toastify";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectQuery = searchParams?.get("redirect");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    role: "Customer",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const errs = {};
    if (!formData.firstName.trim()) {
      errs.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      errs.lastName = "Last name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      errs.email = "Please enter a valid email address";
    }

    // Sri Lankan mobile number validation (07X or +947X)
    const slMobileRegex = /^(0|94|\+94)?[0-9]{9}$/;
    if (!formData.mobileNumber.trim() || !slMobileRegex.test(formData.mobileNumber.replace(/\s/g, ""))) {
      errs.mobileNumber = "Enter a valid Sri Lankan mobile number (e.g. 0771234567)";
    }

    if (!formData.password || formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters long";
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        fname: formData.firstName.trim(),
        lname: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.mobileNumber.trim(),
        password: formData.password,
        image: "",
        role: "Customer",
      };

      const res = await register(payload);

      if (res?.data === "User registered successfully" || res?.status === 200 || res?.status === 201) {
        toast.success("Account created successfully! Please sign in.");
        if (redirectQuery) {
          router.push(`/login?redirect=${encodeURIComponent(redirectQuery)}`);
        } else {
          router.push("/login");
        }
      } else {
        toast.error(typeof res?.data === "string" ? res.data : "Registration failed.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error || "Registration failed. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ModernHeader />

      <main className="min-h-[85vh] bg-slate-50 dark:bg-[#0d0d12] flex items-center justify-center p-4 py-16 relative overflow-hidden transition-colors duration-200">
        {/* Glow */}
        <div className="absolute top-1/4 right-1/3 w-[450px] h-[450px] bg-amber-500/10 dark:bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-slate-200 dark:border-white/15 shadow-xl dark:shadow-2xl relative z-10 bg-white/95 dark:bg-[#12121b]/90">
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
              Create an Account
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Book tickets and support Sri Lankan live theatre
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="firstName"
                    required
                    disabled={isLoading}
                    placeholder="Kasun"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-3 py-2.5 rounded-xl border ${
                      errors.firstName ? "border-red-500" : "border-slate-200 dark:border-white/10"
                    } focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all`}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-[10px] text-red-500 mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="lastName"
                    required
                    disabled={isLoading}
                    placeholder="Perera"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-3 py-2.5 rounded-xl border ${
                      errors.lastName ? "border-red-500" : "border-slate-200 dark:border-white/10"
                    } focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all`}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-[10px] text-red-500 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  disabled={isLoading}
                  placeholder="kasun.perera@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-3 py-2.5 rounded-xl border ${
                    errors.email ? "border-red-500" : "border-slate-200 dark:border-white/10"
                  } focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Sri Lankan Mobile Number * (for SMS E-Ticket)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  name="mobileNumber"
                  required
                  disabled={isLoading}
                  placeholder="0771234567"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-3 py-2.5 rounded-xl border ${
                    errors.mobileNumber ? "border-red-500" : "border-slate-200 dark:border-white/10"
                  } focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all`}
                />
              </div>
              {errors.mobileNumber && (
                <p className="text-[10px] text-red-500 mt-1">{errors.mobileNumber}</p>
              )}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    disabled={isLoading}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-xl border ${
                      errors.password ? "border-red-500" : "border-slate-200 dark:border-white/10"
                    } focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all`}
                  />
                  <button
                    type="button"
                    tabIndex="-1"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    disabled={isLoading}
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-3 py-2.5 rounded-xl border ${
                      errors.confirmPassword ? "border-red-500" : "border-slate-200 dark:border-white/10"
                    } focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[10px] text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-theatre-gold w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 mt-2 shadow-lg shadow-amber-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>

      <ModernFooter />
    </>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#0b0b10]" />}>
      <RegisterContent />
    </React.Suspense>
  );
}
