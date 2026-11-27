import React from "react";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import { ShieldCheck, FileText, AlertCircle, HelpCircle, Building2, Lock, Mail, Phone, MapPin, Scale } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions - Naataka.lk",
  description: "Terms and conditions, booking policies, refund terms, and security standards for Naataka.lk operated by Zeylex Digital Solutions.",
};

export default function TermsPage() {
  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-12 lg:py-16 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Legal Disclosures &amp; Consumer Protection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-2">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Naataka.lk — Operated by Zeylex Digital Solutions (BR: POL/ELH/ESD/02/01/1941/2026) • Country of Domicile: Sri Lanka
            </p>
          </div>

          <div className="ticket-card bg-white dark:bg-[#14141e] p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 space-y-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal shadow-sm">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>1. Agreement Scope &amp; Operating Merchant</span>
              </h2>
              <p>
                Welcome to <strong>Naataka.lk</strong>, Sri Lanka&apos;s digital theatre ticketing platform operated by <strong>Zeylex Digital Solutions</strong> (Business Registration No: <strong>POL/ELH/ESD/02/01/1941/2026</strong>, registered at No-43, Jamburewela, Attanakadawala, 51235, Sri Lanka). By accessing our website, creating an account, or reserving drama tickets, you agree to be legally bound by these Terms and Conditions and all applicable laws of the Democratic Socialist Republic of Sri Lanka.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>2. Online Seat Reservations &amp; Payment Processing</span>
              </h2>
              <p>
                All digital transactions on Naataka.lk are processed securely in Sri Lankan Rupees (LKR) via Central Bank of Sri Lanka (CBSL) approved Internet Payment Gateways. All cardholder interactions are secured through 256-bit SSL/TLS encryption and mandatory 3D Secure authentication (Visa Secure, Mastercard Identity Check, American Express SafeKey). Naataka.lk never captures, processes, or stores raw credit or debit card primary account numbers (PAN), expiration dates, or CVV/CVC codes on its application servers or databases.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>3. Uniform Online Booking Service Fee (Anti-Surcharge Policy)</span>
              </h2>
              <p>
                To maintain fair, non-discriminatory pricing compliant with card scheme rules and Central Bank of Sri Lanka directives, platform service fees are applied uniformly across all payment instruments. The fee is designated as an <strong>Online Booking Service Fee (6.5%)</strong>. Naataka.lk does not levy any differentiated card payment surcharges or gateway convenience fees, ensuring that cardholders pay the exact same total as any other online buyer for the same seat tier.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>4. Instant Digital QR E-Ticket Delivery &amp; Venue Entry Rules</span>
              </h2>
              <p>
                Upon successful payment authorization, official digital QR e-tickets are generated immediately and delivered both on-screen and to the customer&apos;s registered email address. Physical shipping is not provided or required.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400 pt-1 text-xs">
                <li>Each digital ticket contains a cryptographically unique QR entry code valid for a single scan at the theatre entrance gate.</li>
                <li>Ticket holders must present their QR code on a mobile device or printed copy at the auditorium doors.</li>
                <li>Auditorium doors generally open 45 minutes prior to scheduled curtain call. Late arrivals will be seated at the discretion of theatre management during appropriate performance intervals.</li>
                <li>Reselling, replicating, or transferring tickets for commercial gain (scalping) is strictly forbidden and voids the ticket without refund.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>5. Cancellation &amp; Refund Summary</span>
              </h2>
              <p>
                If a theatrical performance is cancelled or postponed by the drama organizer or theatre management, ticket purchasers are entitled to a full ticket face-value refund. Refunds for card purchases are credited strictly back to the original payment card within 5 to 7 working days via the original payment gateway. No cash refunds are permitted for online card transactions. For complete terms, visit our dedicated <Link href="/refund-policy" className="text-amber-600 dark:text-amber-400 underline font-semibold">Refund &amp; Cancellation Policy</Link>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>6. Privacy &amp; Data Protection</span>
              </h2>
              <p>
                We handle personal information in strict compliance with the Sri Lankan Personal Data Protection Act No. 9 of 2022. Personal data is used solely for ticket issuance, admission gate verification, and critical show notifications. Review our <Link href="/privacy-policy" className="text-amber-600 dark:text-amber-400 underline font-semibold">Data Privacy Policy</Link> for detailed disclosure.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>7. Governing Law &amp; Jurisdiction</span>
              </h2>
              <p>
                These Terms and Conditions shall be governed by, construed, and enforced in accordance with the laws of Sri Lanka. Any legal disputes arising out of the use of Naataka.lk shall be subject to the exclusive jurisdiction of the competent courts of Sri Lanka.
              </p>
            </section>

            <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>8. Operating Merchant &amp; Support Contacts</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Operating Legal Entity</span>
                  <span className="font-bold text-slate-900 dark:text-white block">Zeylex Digital Solutions (Naataka.lk)</span>
                  <span className="text-slate-600 dark:text-slate-400 block font-mono">BR No: POL/ELH/ESD/02/01/1941/2026</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Registered Business Address</span>
                  <span className="text-slate-700 dark:text-slate-300 block">No-43, Jamburewela, Attanakadawala, 51235, Sri Lanka</span>
                  <span className="text-slate-500 dark:text-slate-400 block">Country of Domicile: Sri Lanka</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Customer Support Telephones</span>
                  <a href="tel:+94741550909" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline block">+94 74 155 0909</a>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Official Support Emails</span>
                  <a href="mailto:support@naataka.lk" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline block">support@naataka.lk</a>
                  <a href="mailto:hello@zeylex.com" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline block">hello@zeylex.com</a>
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