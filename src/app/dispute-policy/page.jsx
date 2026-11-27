import React from "react";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import { ShieldAlert, CheckCircle2, Clock, Mail, Phone, Building2, FileSearch, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dispute & Chargeback Policy - Naataka.lk",
  description: "Guidelines and protocols for reporting transaction discrepancies, duplicate charges, and payment dispute resolution on Naataka.lk.",
};

export default function DisputePolicyPage() {
  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-12 lg:py-16 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Cardholder Rights &amp; Dispute Resolution</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-2">
              Dispute &amp; Chargeback Resolution Policy
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Naataka.lk — Operated by Zeylex Digital Solutions (BR: POL/ELH/ESD/02/01/1941/2026) • Country of Domicile: Sri Lanka
            </p>
          </div>

          <div className="ticket-card bg-white dark:bg-[#14141e] p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal shadow-sm">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>1. Scope &amp; Eligible Discrepancies</span>
              </h2>
              <p>
                At <strong>Naataka.lk</strong>, operated by <strong>Zeylex Digital Solutions</strong>, we are committed to transparent, fair, and prompt resolution of payment inquiries. Cardholders may raise a formal dispute regarding any of the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li><strong>Duplicate Billing:</strong> Multiple charges debited from your card for a single seat reservation order.</li>
                <li><strong>Non-Delivery of QR E-Ticket:</strong> Successful card payment debited, but digital QR e-ticket was not rendered on screen or delivered to the registered email address.</li>
                <li><strong>Incorrect Debit Amount:</strong> The amount billed on your bank statement differs from the total authorized at checkout.</li>
                <li><strong>Suspected Unauthorized Transaction:</strong> A transaction appearing on your statement that you or an authorized user did not initiate.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>2. 7-Day Reporting Window &amp; Required Information</span>
              </h2>
              <p>
                Cardholders are encouraged to report any suspected billing anomaly to our Merchant Dispute Desk within <strong>seven (7) calendar days</strong> of the transaction date. Prompt reporting ensures expedited resolution before venue admissions close. Please provide:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li>Booking Reference or Order ID (if generated).</li>
                <li>Date and approximate time of the transaction.</li>
                <li>Billed amount in Sri Lankan Rupees (LKR).</li>
                <li>Cardholder name and masked card details (last 4 digits only). <em>Never send your full card number or CVV/CVC code.</em></li>
                <li>A screenshot or digital copy of the bank transaction notification.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>3. 48-Hour Investigation &amp; Resolution Process</span>
              </h2>
              <p>
                Upon receiving your dispute report, our operations and finance team will initiate a comprehensive audit:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li><strong>Cross-Verification:</strong> We cross-reference the transaction with our payment gateway authorization logs, IPN webhook records, and database seat allocation state.</li>
                <li><strong>Delivery Log Audit:</strong> We check SMTP email transmission logs and SMS dispatch receipts for the QR e-ticket.</li>
                <li><strong>Resolution Guarantee:</strong> We guarantee a formal investigative update or conclusive resolution within <strong>48 hours</strong> of receipt of the inquiry.</li>
                <li><strong>Immediate Reversal:</strong> Confirmed duplicate or erroneous charges will be immediately submitted for reversal back to the original card without deduction.</li>
              </ol>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>4. Bank Chargebacks &amp; Pre-Arbitration</span>
              </h2>
              <p>
                While cardholders retain the statutory right to raise a formal chargeback with their card-issuing bank, we strongly advise contacting Naataka.lk directly first. Direct merchant resolution is significantly faster (resolved within 48 hours) compared to interbank chargeback cycles which may take 30 to 45 business days.
              </p>
            </section>

            <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>5. Dispute Support Desk Contacts</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Dispute &amp; Settlement Emails</span>
                  <a href="mailto:support@naataka.lk" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline block">
                    support@naataka.lk
                  </a>
                  <a href="mailto:hello@zeylex.com" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline block">
                    hello@zeylex.com
                  </a>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Support Telephones</span>
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