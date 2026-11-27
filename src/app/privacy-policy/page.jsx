import React from "react";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import { ShieldCheck, Lock, Eye, Server, Building2, Phone, Mail, FileText } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Naataka.lk",
  description: "Privacy policy and data protection standards for Naataka.lk operated by Zeylex Digital Solutions in compliance with Sri Lankan Personal Data Protection Act No. 9 of 2022.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-12 lg:py-16 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3">
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Data Protection &amp; Confidentiality</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-2">
              Data Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Naataka.lk — Operated by Zeylex Digital Solutions (BR: POL/ELH/ESD/02/01/1941/2026) • Country of Domicile: Sri Lanka
            </p>
          </div>

          <div className="ticket-card bg-white dark:bg-[#14141e] p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal shadow-sm">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>1. Commitment to User Privacy</span>
              </h2>
              <p>
                <strong>Zeylex Digital Solutions</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), operating <strong>Naataka.lk</strong>, respects the privacy rights of all theatregoers and platform partners. We are dedicated to safeguarding your personal data in strict compliance with the <strong>Personal Data Protection Act No. 9 of 2022 (PDPA)</strong> of Sri Lanka.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>2. Information We Collect</span>
              </h2>
              <p>To facilitate online stage drama ticket bookings and electronic gate admission, we collect:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li><strong>Contact Identification:</strong> Full name, verified email address, and mobile phone number for ticket dispatch, SMS notifications, and gate validation.</li>
                <li><strong>Booking History:</strong> Performance titles, show dates, seat identifiers, and transaction amounts.</li>
                <li><strong>Technical &amp; Audit Logs:</strong> Timestamped IP addresses, session identifiers, and user agent strings for fraud prevention, rate limiting, and security auditing.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>3. Payment Card Data Security — Zero Raw PAN Storage</span>
              </h2>
              <p>
                <strong>Naataka.lk never captures, handles, or stores raw credit or debit card numbers</strong>, expiration dates, or CVV/CVC verification codes on our servers or databases. All payment transactions are executed via direct encrypted interfaces with Central Bank of Sri Lanka (CBSL) approved Internet Payment Gateways.
              </p>
              <p>
                Our payment gateway partners comply with the highest level of global data security standards (PCI-DSS Level 1) and utilize 256-bit SSL/TLS encryption. Only non-sensitive reference tokens, masked card identifiers (last 4 digits), and acquiring bank authorization codes are transmitted to Naataka.lk for audit and receipt generation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>4. Purpose of Data Processing &amp; Strict Data Sharing</span>
              </h2>
              <p>Your personal information is strictly used for legitimate business purposes:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li>Issuing and transmitting electronic QR code tickets via email and SMS.</li>
                <li>Auditorium entrance validation and ticket scanner verification by authorized theatre staff.</li>
                <li>Transmitting urgent notifications regarding show rescheduling, venue updates, or cancellations.</li>
                <li>Facilitating authorized refunds and financial reconciliation.</li>
              </ul>
              <p className="pt-1">
                <strong>Data Sharing Boundaries:</strong> Data is shared <strong>strictly and exclusively</strong> with CBSL-approved payment processors (for transaction settlement) and authorized drama organizers/theatre managers (for entrance validation). We never sell, rent, monetize, or disclose your personal data to external third-party advertisers or data brokers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>5. Data Subject Rights Under Sri Lankan Law</span>
              </h2>
              <p>Under the Sri Lankan Personal Data Protection Act, registered users have the right to:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li>Access the personal information held about you via your user dashboard.</li>
                <li>Request rectification of inaccurate contact details.</li>
                <li>Request deletion or anonymization of your profile, subject to statutory accounting retention obligations.</li>
              </ul>
            </section>

            <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>6. Merchant Details &amp; Data Protection Officer Contact</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Data Controller</span>
                  <span className="font-bold text-slate-900 dark:text-white block">Zeylex Digital Solutions</span>
                  <span className="text-slate-600 dark:text-slate-400 block font-mono">BR No: POL/ELH/ESD/02/01/1941/2026</span>
                  <span className="text-slate-600 dark:text-slate-400 block">No-43, Jamburewela, Attanakadawala, 51235, Sri Lanka</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Privacy &amp; Security Inquiries</span>
                  <a href="mailto:support@naataka.lk" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline block">
                    support@naataka.lk
                  </a>
                  <a href="mailto:hello@zeylex.com" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline block">
                    hello@zeylex.com
                  </a>
                  <a href="tel:+94741550909" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline block">
                    +94 74 155 0909
                  </a>
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