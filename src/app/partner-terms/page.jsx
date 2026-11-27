import React from "react";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import { Handshake, Building2, DollarSign, CalendarCheck, ShieldAlert, FileText, Scale } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Theater Manager & Drama Producer Agreement - Naataka.lk",
  description: "Unified commercial terms, settlement schedules, and cancellation liability framework for theatrical producers and venue managers partnering with Naataka.lk.",
};

export default function PartnerTermsPage() {
  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-12 lg:py-16 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3">
              <Handshake className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Commercial Partnership &amp; Production Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-2">
              Theater Manager &amp; Drama Producer Agreement
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Naataka.lk — Operated by Zeylex Digital Solutions (BR: POL/ELH/ESD/02/01/1941/2026) • Country of Domicile: Sri Lanka
            </p>
          </div>

          <div className="ticket-card bg-white dark:bg-[#14141e] p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal shadow-sm">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>1. Parties &amp; Purpose</span>
              </h2>
              <p>
                This Unified Agreement sets forth the commercial terms and operational guidelines governing theatrical stage drama producers, event organizers, and theatre managers (&quot;Producer/Partner&quot;) listing performances and selling reserved seating tickets on <strong>Naataka.lk</strong>, operated by <strong>Zeylex Digital Solutions</strong> (&quot;Platform Operator&quot;).
              </p>
            </section>

            <section className="space-y-4 p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-500/5 border border-amber-300/60 dark:border-amber-500/20">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>2. Payment Processing, Settlement &amp; Event Cancellation Framework</span>
              </h2>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    2.1 Online Ticket Payment Collection
                  </h3>
                  <p>
                    All online ticket payments for performances hosted on Naataka.lk are collected directly by <strong>Zeylex Digital Solutions</strong> as the registered merchant of record through Central Bank of Sri Lanka (CBSL) approved Internet Payment Gateways in Sri Lankan Rupees (LKR).
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    2.2 Payout Schedule &amp; Bank Settlement
                  </h3>
                  <p>
                    Net ticket proceeds (calculated as gross ticket face value less agreed platform commission and applicable electronic payment gateway charges) are settled directly to the Producer/Theater Manager&apos;s nominated Sri Lankan commercial bank account within <strong>2 to 4 business days</strong> following confirmation of bank settlement and verified completion of the theatrical performance.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    2.3 Cancellation Liability &amp; Buyer Refund Mandate
                  </h3>
                  <p>
                    If a Producer or Theater Manager cancels, postpones, or materially reschedules a show after online ticket sales have commenced:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 pt-1 text-xs">
                    <li>The Producer/Theater Manager bears <strong>sole and full financial liability</strong> for all ticket refunds owed to purchasers.</li>
                    <li>Zeylex Digital Solutions will initiate full face-value refunds directly to the original payment cards of all ticket buyers, completed within <strong>5 to 7 working days</strong> via the original payment gateway.</li>
                    <li>Under no circumstances are cash refunds permitted for card-purchased tickets.</li>
                    <li>Agreed platform commissions and payment gateway interchange fees incurred during original ticket processing are <strong>strictly non-refundable</strong> and will be invoiced to or debited from the Producer&apos;s account balance or future payouts.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>3. Venue Admission &amp; Single-Scan Gate Validation</span>
              </h2>
              <p>
                The Producer and venue management are provided with real-time access to the Naataka.lk Gate Scanner web application. Each attendee&apos;s digital QR e-ticket must be scanned once at the entrance door to authenticate admission. The Platform Operator maintains authoritative cryptographically signed records of all gate admissions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>4. Intellectual Property &amp; Performance Rights</span>
              </h2>
              <p>
                The Drama Producer warrants and represents that they possess all legal authorizations, performance licenses, script rights, and Public Performances Board (PPB) clearances required under Sri Lankan law for the staged production. The Producer indemnifies Zeylex Digital Solutions against any claims or copyright disputes.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>5. Governing Law</span>
              </h2>
              <p>
                This Agreement shall be governed by and interpreted under the commercial and civil laws of the Democratic Socialist Republic of Sri Lanka.
              </p>
            </section>

            <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>6. Merchant Operator Details</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Platform Operating Company</span>
                  <span className="font-bold text-slate-900 dark:text-white block">Zeylex Digital Solutions</span>
                  <span className="text-slate-600 dark:text-slate-400 block font-mono">BR No: POL/ELH/ESD/02/01/1941/2026</span>
                  <span className="text-slate-600 dark:text-slate-400 block">No-43, Jamburewela, Attanakadawala, 51235, Sri Lanka</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Producer Relations &amp; Settlement Desk</span>
                  <a href="mailto:hello@zeylex.com" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline block">
                    hello@zeylex.com
                  </a>
                  <a href="mailto:support@naataka.lk" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline block">
                    support@naataka.lk
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