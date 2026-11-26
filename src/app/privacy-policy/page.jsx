import React from "react";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import { ShieldCheck, Lock, Eye, Server, Building2, Phone, Mail, FileText } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — eNataka.lk",
  description: "Privacy policy and data protection standards for eNataka.lk operated by Zeylex Digital Solutions in compliance with Sri Lankan Personal Data Protection Act No. 9 of 2022.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-12 lg:py-16 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3">
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Data Protection & Privacy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-2">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Operated by Zeylex Digital Solutions (BR No: POL/ELH/ESD/02/01/1941/2026) • Effective: November 2026
            </p>
          </div>

          <div className="ticket-card bg-white dark:bg-[#14141e] p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal shadow-sm">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>1. Commitment to User Privacy</span>
              </h2>
              <p>
                <strong>Zeylex Digital Solutions</strong> ("we", "us", "our"), operator of <strong>eNataka.lk</strong>, respects your privacy and is committed to protecting your personal data in accordance with Sri Lanka's <strong>Personal Data Protection Act No. 9 of 2022 (PDPA)</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>2. Information We Collect</span>
              </h2>
              <p>When you use eNataka.lk to browse or purchase stage drama tickets, we may collect:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li><strong>Contact Details:</strong> First name, last name, email address, and mobile phone number for ticket dispatch and gate verification.</li>
                <li><strong>Transaction Records:</strong> Order identifier, seats reserved, and payment status.</li>
                <li><strong>Technical Information:</strong> IP address and browser type for fraud detection and security auditing.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>3. Payment Card Data Security (PayHere)</span>
              </h2>
              <p>
                We do not collect, process, or store credit or debit card numbers, CVV codes, or bank credentials on our servers. All financial transactions are securely processed directly by <strong>PayHere</strong>, an authorized Payment Service Provider monitored by the Central Bank of Sri Lanka (CBSL). PayHere complies with global <strong>PCI-DSS Level 1</strong> security standards and employs 256-bit SSL encryption.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>4. Purpose of Data Processing</span>
              </h2>
              <p>Your personal information is strictly used for:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li>Issuing and transmitting electronic QR code tickets via SMS and email.</li>
                <li>Auditorium entrance validation and gate admission by authorized theatre staff.</li>
                <li>Notifying patrons regarding show rescheduling or cancellations.</li>
                <li>Processing refunds and accounting reconciliation.</li>
              </ul>
              <p className="pt-1 text-slate-600 dark:text-slate-300">
                We will never sell, lease, or distribute your personal contact information to third-party marketing companies.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>5. Your Data Protection Rights</span>
              </h2>
              <p>Under Sri Lankan data protection law, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li>Access the personal information held about you in your user account dashboard.</li>
                <li>Request correction of inaccurate personal or contact details.</li>
                <li>Request erasure of your account and personal records by contacting our privacy desk.</li>
              </ul>
            </section>

            <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>6. Merchant Identity & Data Protection Officer Contact</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Operating Company</span>
                  <span className="font-bold text-slate-900 dark:text-white block">Zeylex Digital Solutions</span>
                  <span className="text-slate-600 dark:text-slate-400 block font-mono">BR No: POL/ELH/ESD/02/01/1941/2026</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Registered Address</span>
                  <span className="text-slate-700 dark:text-slate-300 block">No. 43, Jamburewela, Aththanakadawala, 51235, Sri Lanka</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Support Telephone</span>
                  <a href="tel:+94741550909" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline block">+94 74 155 0909</a>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Privacy & Inquiries Email</span>
                  <a href="mailto:admin@zeylex.com" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline block">admin@zeylex.com</a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <ModernFooter />
    </>
  );
}
