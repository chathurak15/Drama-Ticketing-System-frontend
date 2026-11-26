"use client";

import React, { useState } from "react";
import ModernHeader from "../../Components/modern/Header";
import ModernFooter from "../../Components/modern/Footer";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Building,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);

    setTimeout(() => {
      setSending(false);
      toast.success("Thank you! Your message has been sent to our Colombo support desk.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 1200);
  };

  return (
    <>
      <ModernHeader />

      <main className="flex-1 bg-slate-50 dark:bg-[#0d0d12] text-slate-900 dark:text-slate-100 py-12 lg:py-16 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#661F19]/10 dark:bg-[#661F19]/40 border border-[#661F19]/30 dark:border-[#661F19] text-[#661F19] dark:text-amber-300 text-xs font-semibold mb-3">
              <Headphones className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>පාරිභෝගික සහය • Sri Lanka Customer Support</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-3">
              Get in Touch
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Need assistance with your booking or interested in listing your stage drama? We are here to help!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Contact Details Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="ticket-card bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  Colombo Headquarters
                </h3>

                <div className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Nataka.lk Support Office</p>
                    <p className="text-slate-500 dark:text-slate-400">Guilford Crescent, Colombo 07, Western Province, Sri Lanka</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Hotline</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      <a href="tel:+94741550909" className="hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors">+94 74 155 0909</a> / <a href="tel:+94112345678" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">011 234 5678</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Email Address</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      <a href="mailto:support@nataka.lk" className="hover:underline">support@nataka.lk</a> / <a href="mailto:tickets@nataka.lk" className="hover:underline">tickets@nataka.lk</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Card */}
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:to-[#0e1f14] border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Need Fast Help?</h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">Chat with our Colombo team on WhatsApp</p>
                </div>
                <a
                  href="https://wa.me/94741550909"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Drama Producers Callout */}
              <div className="ticket-card bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
                  Drama Organizers & Theatres
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Interested in selling tickets for your upcoming play or auditorium? Contact our partnerships desk directly at <span className="text-slate-900 dark:text-white font-semibold">organizers@nataka.lk</span>.
                </p>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="ticket-card bg-white dark:bg-[#14141e] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Send Us a Message</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Kasun Jayawardena"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="kasun@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Contact Number</label>
                      <input
                        type="tel"
                        placeholder="074 155 0909"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Booking inquiry or feedback"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Message *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please let us know how we can assist you..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#181824] text-xs sm:text-sm text-slate-900 dark:text-white p-3.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-amber-500 focus:bg-white dark:focus:bg-[#181824] focus:outline-none resize-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-theatre-gold w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? "Sending Message..." : "Send Message"}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ModernFooter />
    </>
  );
}
