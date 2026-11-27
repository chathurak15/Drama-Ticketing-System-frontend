"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { toast } from "react-toastify";

export default function ShareModal({
  isOpen,
  onClose,
  title = "Sri Lanka Stage Drama",
  text = "Check out this stage drama on Naataka.lk!",
  url = typeof window !== "undefined" ? window.location.href : "",
  image = "",
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = `${title} - Official Sri Lanka Stage Drama Tickets on Naataka.lk 🎭`;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(`${shareText}\n${currentUrl}`);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      toast.error("Failed to copy link.");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: currentUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
      bg: "bg-emerald-600 hover:bg-emerald-500 text-white",
      onClick: () => {
        window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      name: "Facebook",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      bg: "bg-blue-600 hover:bg-blue-500 text-white",
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      name: "X / Twitter",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      bg: "bg-black hover:bg-neutral-800 text-white border border-white/20",
      onClick: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedUrl}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      name: "Telegram",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.65-.53.81-1.08.51l-3-2.21-1.45 1.39c-.16.16-.3.3-.61.3l.21-3.05 5.56-5.02c.24-.22-.05-.34-.38-.13l-6.87 4.33-2.96-.92c-.64-.2-.65-.64.14-.95l11.58-4.46c.54-.19 1.01.13.83.92z" />
        </svg>
      ),
      bg: "bg-sky-500 hover:bg-sky-400 text-white",
      onClick: () => {
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
      },
    },
  ];

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#14141e] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden p-6 text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Close share dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans'] leading-snug">
              Share Stage Drama
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Invite friends & theatre lovers across Sri Lanka
            </p>
          </div>
        </div>

        {/* Drama Preview Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-6">
          {image && (
            <img
              src={image}
              alt={title}
              className="w-12 h-16 object-cover rounded-xl bg-slate-200 dark:bg-black shrink-0"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {title}
            </h4>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              Naataka.lk • Sri Lanka Stage Drama
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {currentUrl}
            </p>
          </div>
        </div>

        {/* Social Channels */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {shareOptions.map((opt) => (
            <button
              key={opt.name}
              onClick={opt.onClick}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-transform hover:scale-105 active:scale-95 shadow-sm ${opt.bg}`}
            >
              {opt.icon}
              <span className="text-[11px] font-semibold">{opt.name}</span>
            </button>
          ))}
        </div>

        {/* Native Web Share Button (if supported) */}
        {hasNativeShare && (
          <button
            onClick={handleNativeShare}
            className="w-full mb-4 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4 text-amber-500" />
            <span>More Sharing Options (Device Menu)</span>
          </button>
        )}

        {/* Copy Link Input Bar */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
            Drama Link (Secure Slug)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-slate-50 dark:bg-[#0d0d14] text-xs text-slate-700 dark:text-slate-300 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "btn-theatre-gold text-slate-900"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
