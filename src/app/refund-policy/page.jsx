import React from "react";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import { ShieldCheck, HelpCircle, AlertCircle, RefreshCw, Clock, Building2, Phone, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Refund & Cancellation Policy - Naataka.lk",
  description: "Official cancellation, exchange, and refund guidelines for stage drama tickets booked on Naataka.lk operated by Zeylex Digital Solutions.",
};

export default function RefundPolicyPage() {
  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-12 lg:py-16 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3">
              <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Consumer Protection &amp; Financial Disclosures</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-2">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Naataka.lk — Operated by Zeylex Digital Solutions (BR: POL/ELH/ESD/02/01/1941/2026) • Country of Domicile: Sri Lanka
            </p>
          </div>

          <div className="ticket-card bg-white dark:bg-[#14141e] p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal shadow-sm">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Summary for Online Ticket Purchasers</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                If an event is cancelled or rescheduled by the organizer, ticket holders receive a full ticket face-value refund directly to their original payment card within 5 to 7 working days via the original payment gateway. No cash refunds are permitted for card payments.
              </p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>1. Event Cancellation or Rescheduling by Drama Organizer</span>
              </h2>
              <p>
                In the event that a theatrical production or scheduled stage drama is cancelled, postponed, or rescheduled by the event producer, drama organizer, or venue management:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li>Ticket holders will be promptly notified via SMS and email with details regarding the rescheduled date or cancellation status.</li>
                <li>Ticket holders may choose to retain their digital QR ticket for the rescheduled show date or request a <strong>full refund of the ticket face value</strong>.</li>
                <li>Refunds for online card transactions are processed strictly back to the <strong>original payment card within 5–7 working days</strong> via the original payment gateway.</li>
                <li><strong>Strict No Cash Policy:</strong> Under no circumstances will refunds for card transactions be paid out in physical cash, cheques, or transferred to third-party bank accounts.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>2. Buyer-Initiated Cancellation Rules</span>
              </h2>
              <p>
                Because theatre seats are held exclusively upon booking and blocked from other patrons in real time:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li><strong>Within 24 Hours of Showtime:</strong> Buyer-initiated cancellations are strictly <strong>non-refundable</strong>. Tickets cannot be voided, refunded, or credited once inside this 24-hour window.</li>
                <li><strong>More than 24 Hours Prior to Showtime:</strong> Cancellation requests submitted more than 24 hours prior to curtain call may be considered on a case-by-case basis subject to organizer approval.</li>
                <li><strong>Online Booking Service Fee:</strong> The uniform Online Booking Service Fee (6.5%) covers non-recoverable electronic gateway processing and cryptographic verification network charges and is non-refundable.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>3. Refund Processing Method &amp; Settlement Timelines</span>
              </h2>
              <p>
                Once an authorized refund is approved by Naataka.lk:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li>The refund request is electronically submitted through our CBSL-approved payment processor to the acquiring bank.</li>
                <li>Reversal funds will reflect on the cardholder&apos;s statement within <strong>5 to 7 banking business days</strong>, depending on the card issuer&apos;s settlement cycle.</li>
                <li>An official digital refund receipt with transaction reference code and credit authorization details will be transmitted to the buyer&apos;s registered email.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>4. How to Request a Refund</span>
              </h2>
              <p>
                To request a refund for a cancelled or rescheduled performance, contact our customer desk with your Booking Reference number (e.g. WEN-001-C04-00192):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Email Desk</span>
                  <a href="mailto:support@naataka.lk" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline block text-xs">
                    support@naataka.lk
                  </a>
                  <a href="mailto:hello@zeylex.com" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline block text-xs">
                    hello@zeylex.com
                  </a>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Response within 24 business hours</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Telephone Assistance</span>
                  <a href="tel:+94741550909" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline block text-xs">
                    +94 74 155 0909
                  </a>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Monday to Sunday: 9:00 AM – 8:00 PM</span>
                </div>
              </div>
            </section>

            <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>5. Operating Legal Entity</span>
              </h2>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs space-y-1">
                <p>
                  <strong>Naataka.lk</strong> is operated by <strong>Zeylex Digital Solutions</strong>.
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Business Registration Number: <strong>POL/ELH/ESD/02/01/1941/2026</strong> | Country of Domicile: Sri Lanka
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Registered Address: No-43, Jamburewela, Attanakadawala, 51235, Sri Lanka
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <ModernFooter />
    </>
  );
}