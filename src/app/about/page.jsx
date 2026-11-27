import React from "react";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import { Landmark, Heart, ShieldCheck, Users, Ticket, Award } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us - Naataka.lk | Sri Lanka's Stage Drama Hub",
  description: "Learn about Naataka.lk mission to celebrate and digitize Sri Lankan stage drama and theatre ticketing.",
};

export default function AboutPage() {
  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-12 lg:py-16 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#661F19]/10 dark:bg-[#661F19]/40 border border-[#661F19]/30 dark:border-[#661F19] text-[#661F19] dark:text-amber-300 text-xs font-semibold mb-3">
              <Landmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>වේදිකා නාට්‍ය උරුමය • Sri Lankan Theatre Heritage</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-4 leading-tight">
              About Naataka<span className="text-amber-600 dark:text-amber-400">.lk</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Connecting thousands of drama enthusiasts across Sri Lanka with the island's richest theatrical productions, master actors, and legendary auditoriums.
            </p>
          </div>

          {/* Story & Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="ticket-card bg-white dark:bg-[#14141e] p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Heart className="w-6 h-6 text-red-500 fill-red-500/20" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                Our Story
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Stage drama has always been the heart and soul of Sri Lankan cultural storytelling - from timeless classics like Suba Saha Yasa, Maname, and Sinhabahu to contemporary masterpieces. Naataka.lk was born out of a desire to eliminate long queues and make ticketing effortless, transparent, and completely secure for every Sri Lankan theatre fan.
              </p>
            </div>

            <div className="ticket-card bg-white dark:bg-[#14141e] p-8 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                Our Mission
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                To empower Sri Lankan dramatists, directors, and historic theatre halls with cutting-edge ticketing technology, real-time seat inventory, and reliable payment solutions via Central Bank of Sri Lanka (CBSL) approved Internet Payment Gateways - ensuring that every show reaches its full audience potential.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            <div className="ticket-card bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 text-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-white/5 border border-amber-200 dark:border-white/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-3">
                <Ticket className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Instant QR Tickets</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                No printing required. Scan your QR e-ticket directly from your smartphone at the gate.
              </p>
            </div>

            <div className="ticket-card bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 text-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-white/5 border border-emerald-200 dark:border-white/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">CBSL-Approved IPG</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Pay securely in LKR with Visa, Mastercard, or American Express protected by 256-bit encryption and 3D Secure.
              </p>
            </div>

            <div className="ticket-card bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 text-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Verified Venues</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Official partnerships with Lionel Wendt, Nelum Pokuna, Elphinstone, and leading theatres.
              </p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="text-center p-8 rounded-3xl bg-gradient-to-r from-[#661F19] via-[#4A1410] to-[#2B0B08] text-white border border-amber-500/40 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2 font-['Plus_Jakarta_Sans']">
              Experience the Stage Tonight
            </h3>
            <p className="text-xs text-slate-200 max-w-md mx-auto mb-6">
              Browse the upcoming drama schedules and secure your favorite seats in seconds.
            </p>
            <Link href="/shows" className="btn-theatre-gold px-8 py-3 rounded-full text-xs font-bold inline-block shadow-md cursor-pointer">
              Browse Upcoming Shows
            </Link>
          </div>
        </div>
      </main>

      <ModernFooter />
    </>
  );
}
