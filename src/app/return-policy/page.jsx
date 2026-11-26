import React from "react";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import { ShieldCheck, HelpCircle, AlertCircle, RefreshCw, Clock, Building2, Phone, Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Return & Refund Policy — eNataka.lk",
  description: "Official cancellation, exchange, and refund guidelines for stage drama tickets booked on eNataka.lk operated by Zeylex Digital Solutions.",
};

export default function ReturnPolicyPage() {
  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-12 lg:py-16 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3">
              <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Customer Satisfaction & Refunds</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-2">
              Return & Refund Policy
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Operated by Zeylex Digital Solutions (BR No: POL/ELH/ESD/02/01/1941/2026) • Colombo, Sri Lanka
            </p>
          </div>

          <div className="ticket-card bg-white dark:bg-[#14141e] p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal shadow-sm">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>1. Show Cancellation or Postponement by Organizer</span>
              </h2>
              <p>
                If a theatrical stage production or scheduled drama show is cancelled or postponed by the drama organizer, venue management, or government directives:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li>All registered ticket purchasers will receive immediate notification via SMS and Email.</li>
                <li>Ticket holders will be given the option to retain their ticket for the rescheduled show date or receive a <strong>100% full refund</strong> of the ticket face value.</li>
                <li>Refunds are initiated automatically or upon request to our support desk without penalty.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>2. Customer-Initiated Cancellations</span>
              </h2>
              <p>
                We understand that unexpected schedule changes happen. Ticket holders may request a cancellation under the following conditions:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li>Cancellation requests must be submitted at least <strong>48 hours prior</strong> to the scheduled show commencement time.</li>
                <li>Requests submitted less than 48 hours before curtain call cannot be refunded, as auditorium seats are exclusively reserved and prevented from being purchased by other patrons.</li>
                <li>Online payment gateway convenience fees (if applicable) cover third-party financial network charges and are non-refundable.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>3. Refund Processing Timeline</span>
              </h2>
              <p>
                Once a refund is approved by our operations desk:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li>The transaction reversal is immediately transmitted to our secure payment gateway partner (PayHere).</li>
                <li>Funds will reflect back in the customer's original payment method (Credit/Debit Card, eZ Cash, mCash, or FriMi account) within <strong>5 to 7 banking business days</strong> depending on your card-issuing bank.</li>
                <li>An official refund confirmation receipt with transaction reference is emailed upon completion.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>4. How to Request a Refund</span>
              </h2>
              <p>
                To initiate a refund request, please provide your Booking ID and mobile number via:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Customer Hotline</span>
                  </div>
                  <a href="tel:+94741550909" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline block text-xs">
                    +94 74 155 0909 (9AM - 8PM)
                  </a>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Immediate assistance by our support team</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Email Support</span>
                  </div>
                  <a href="mailto:admin@zeylex.com" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline block text-xs">
                    admin@zeylex.com
                  </a>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Response within 12 business hours</span>
                </div>
              </div>
            </section>

            <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>5. Merchant Operator Information</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                eNataka.lk is proudly operated by <strong>Zeylex Digital Solutions</strong> (Business Reg: <strong>POL/ELH/ESD/02/01/1941/2026</strong>), registered at No. 43, Jamburewela, Aththanakadawala, 51235, Sri Lanka.
              </p>
            </section>
          </div>
        </div>
      </main>

      <ModernFooter />
    </>
  );
}
