"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import {
  ShieldCheck,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  Lock,
} from "lucide-react";
import { unlockAccount } from "../../services/AuthService";
import { toast } from "react-toastify";

function UnlockAccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("VERIFYING"); // "VERIFYING" | "SUCCESS" | "ERROR"
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("ERROR");
      setErrorMessage("No security unlock token was provided in the URL.");
      return;
    }

    let isMounted = true;
    unlockAccount(token)
      .then((res) => {
        if (isMounted) {
          setStatus("SUCCESS");
          toast.success("Account successfully unlocked!");
        }
      })
      .catch((err) => {
        if (isMounted) {
          setStatus("ERROR");
          const msg =
            err.response?.data?.message ||
            "This account unlock link is invalid or has already expired.";
          setErrorMessage(msg);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-white/15 shadow-xl dark:shadow-2xl relative z-10 bg-white/95 dark:bg-[#12121b]/90 text-center">
      <Link href="/" className="inline-block mb-6">
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

      {/* 1. VERIFYING STATE */}
      {status === "VERIFYING" && (
        <div className="py-8 space-y-4">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
            Verifying Security Link...
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
            Validating your account unlock link securely...
          </p>
        </div>
      )}

      {/* 2. SUCCESS STATE */}
      {status === "SUCCESS" && (
        <div className="py-4 space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              Account Unlocked!
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Your failed login attempt counter has been reset and your account is fully restored to <strong>ACTIVE</strong> status.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="btn-theatre-gold w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
            >
              <span>Sign In Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. ERROR / EXPIRED STATE */}
      {status === "ERROR" && (
        <div className="py-4 space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              Unlock Link Expired or Invalid
            </h2>
            <p className="text-xs text-rose-600 dark:text-rose-300 mt-2 leading-relaxed">
              {errorMessage}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/login"
              className="btn-theatre-gold w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>

            <Link
              href="/login"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center gap-2 transition-colors"
            >
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Request Password Reset</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UnlockAccountPage() {
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
          <UnlockAccountContent />
        </Suspense>
      </main>
      <ModernFooter />
    </>
  );
}
