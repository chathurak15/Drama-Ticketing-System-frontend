"use client";

import React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CreditCard,
  Heart,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  Lock,
  Globe,
  FileCheck2,
  Building2,
  Scale
} from "lucide-react";
import PaymentSchemeBadges from "../common/PaymentSchemeBadges";

export default function ModernFooter() {
  return (
    <footer className="bg-slate-100 dark:bg-[#09090e] border-t border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 pt-12 pb-8 transition-colors duration-200">
      <div className="desktop-container">
        <div className="mb-14 p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-[#171724] dark:via-[#1f192b] dark:to-[#171724] border border-slate-200 dark:border-amber-500/20 shadow-sm dark:shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                Sri Lanka's 100% Secure Ticketing Platform
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                All transactions are processed in Sri Lankan Rupees (LKR) and protected by SSL/TLS encryption &amp; 3D Secure authentication.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <PaymentSchemeBadges size="md" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/logo-nataka.png"
                alt="Naataka.lk"
                className="h-8 w-auto object-contain block dark:hidden"
              />
              <img
                src="/logo-nataka-white.png"
                alt="Naataka.lk"
                className="h-8 w-auto object-contain hidden dark:block"
              />
            </Link>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Sri Lanka's dedicated digital platform for live stage drama and theatre ticket reservations. Connecting Sri Lankan drama enthusiasts with celebrated theatrical productions, artists, and historic stages.
            </p>

            <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs shadow-sm space-y-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">
                Brand &amp; Operating Legal Entity:
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-xs block">
                Naataka.lk - Operated by Zeylex Digital Solutions
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block font-mono">
                BR No: <strong className="text-amber-600 dark:text-amber-400 font-bold">POL/ELH/ESD/02/01/1941/2026</strong>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>No-43, Jamburewela, Attanakadawala, 51235, Sri Lanka</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Country of Domicile: Sri Lanka</span>
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-transparent flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-transparent flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-transparent flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/94741550909"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-600/20 hover:bg-emerald-200 dark:hover:bg-emerald-600/40 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400">
              Popular Venues
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/shows?venue=Lionel+Wendt" className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                  Lionel Wendt Theatre, Colombo 07
                </Link>
              </li>
              <li>
                <Link href="/shows?venue=Nelum+Pokuna" className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                  Nelum Pokuna Mahinda Rajapaksa Theatre
                </Link>
              </li>
              <li>
                <Link href="/shows?venue=Elphinstone" className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                  Elphinstone Theatre, Maradana
                </Link>
              </li>
              <li>
                <Link href="/shows?venue=Tower+Hall" className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                  Tower Hall Theatre, Colombo 10
                </Link>
              </li>
              <li>
                <Link href="/shows?venue=YMBA" className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                  YMBA Main Auditorium, Borella
                </Link>
              </li>
              <li>
                <Link href="/shows?venue=Sarachchandra" className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                  Sarachchandra Open Air Theatre, Peradeniya
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400">
              Legal Disclosures &amp; Policies
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/terms" className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium">
                  Refund &amp; Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/dispute-policy" className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium">
                  Dispute &amp; Chargeback Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium">
                  Data Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/partner-terms" className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium">
                  Theater &amp; Producer Agreement
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                  About Naataka.lk
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider font-['Plus_Jakarta_Sans'] text-amber-700 dark:text-amber-400">
              Customer Support
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Customer Hotlines:</span>
                  <a href="tel:+94741550909" className="hover:text-amber-600 dark:text-amber-400 font-semibold transition-colors">
                    +94 74 155 0909
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Support Emails:</span>
                  <a href="mailto:support@naataka.lk" className="hover:underline font-semibold">
                    support@naataka.lk
                  </a>
                  <a href="mailto:hello@zeylex.com" className="hover:underline font-semibold">
                    hello@zeylex.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>No-43, Jamburewela, Attanakadawala, 51235, Sri Lanka</span>
              </div>
              <div className="pt-2">
                <a
                  href="https://wa.me/94741550909"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-600/20 hover:bg-emerald-200 dark:hover:bg-emerald-600/30 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-semibold text-xs transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Naataka.lk - Operated by{" "}
            <strong className="text-slate-800 dark:text-slate-300 font-semibold">
              Zeylex Digital Solutions
            </strong>{" "}
            (BR: <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">POL/ELH/ESD/02/01/1941/2026</span>). Country of Domicile: Sri Lanka.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/terms" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
              Terms &amp; Conditions
            </Link>
            <span>•</span>
            <Link href="/refund-policy" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
              Refund &amp; Cancellation
            </Link>
            <span>•</span>
            <Link href="/dispute-policy" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
              Dispute Policy
            </Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/partner-terms" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
              Partner Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
