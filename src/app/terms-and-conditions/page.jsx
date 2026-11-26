import React from "react";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import { ShieldCheck, FileText, AlertCircle, HelpCircle, Building2, Lock } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions — eNataka.lk",
  description: "Terms and conditions, booking policies, refund terms, and security standards for eNataka.lk operated by Zeylex Digital Solutions.",
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-12 lg:py-16 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Legal & Consumer Protection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-2">
              Terms & Conditions
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Operated by Zeylex Digital Solutions • Last updated: November 2026 • Colombo, Sri Lanka
            </p>
          </div>

          <div className="ticket-card bg-white dark:bg-[#14141e] p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal shadow-sm">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>1. General Overview & Agreement</span>
              </h2>
              <p>
                eNataka.lk is Sri Lanka's premier digital stage drama ticketing platform operated by <strong>Zeylex Digital Solutions</strong> (Business Registration No: <strong>POL/ELH/ESD/02/01/1941/2026</strong>). By purchasing tickets or utilizing our platform, you acknowledge and agree to comply with the terms stipulated herein, auditorium house rules, and applicable Sri Lankan laws.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>2. Payment Security & PayHere Processing</span>
              </h2>
              <p>
                All digital transactions on eNataka.lk are securely processed via <strong>PayHere</strong> (Central Bank of Sri Lanka approved Payment Service Provider). eNataka.lk does not directly store credit/debit card numbers or sensitive banking PINs on its servers. All data transmissions are protected via 256-bit SSL encryption.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>3. Ticket Delivery & Auditorium Admission</span>
              </h2>
              <p>
                Upon successful payment completion, your official QR code E-Ticket is immediately generated and sent via SMS / Email, and remains accessible in your account dashboard. Each QR code is uniquely encrypted and verifiable once at the auditorium entrance.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li>Gates at venues (Lionel Wendt, Nelum Pokuna, Elphinstone, Tower Hall, etc.) generally open 45 minutes prior to the show.</li>
                <li>Children under the age specified by the drama organizer may require adult supervision.</li>
                <li>Recording devices and unauthorized flash photography during the performance are strictly prohibited by theatre regulations.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>4. Cancellation & Refund Policy</span>
              </h2>
              <p>
                In the event that a show is cancelled or rescheduled by the drama organizer due to unforeseen circumstances, ticket holders are entitled to a full refund or exchange for an alternate date.
              </p>
              <p>
                Customer-initiated cancellation requests must be made at least 48 hours before the scheduled curtain call through your account dashboard or by contacting our hotline at <a href="tel:+94741550909" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">+94 74 155 0909</a> or email at <a href="mailto:admin@zeylex.com" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">admin@zeylex.com</a>. Approved refunds are processed back to the original payment method within 5-7 banking business days. Read our full <Link href="/return-policy" className="text-amber-600 dark:text-amber-400 underline font-semibold">Return & Refund Policy</Link>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>5. Anti-Counterfeiting & Fair Scalping Measures</span>
              </h2>
              <p>
                Reselling tickets at inflated rates above the authorized face value (ticket scalping) is strictly prohibited and may result in the immediate revocation of the ticket without compensation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>6. Privacy & Personal Data Protection</span>
              </h2>
              <p>
                We value your privacy and comply with Sri Lanka's Personal Data Protection Act No. 9 of 2022. Your personal details (name, email, phone number) are collected solely to deliver e-tickets, provide SMS gate verification, and process payments securely via PayHere. We never sell or distribute your data to unauthorized third parties. For full details, see our <Link href="/privacy-policy" className="text-amber-600 dark:text-amber-400 underline font-semibold">Privacy Policy</Link>.
              </p>
            </section>

            <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>7. Operating Merchant Details & Contact</span>
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
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Support Hotline</span>
                  <a href="tel:+94741550909" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline block">+94 74 155 0909 (9AM - 8PM)</a>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Support & Inquiries Email</span>
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
