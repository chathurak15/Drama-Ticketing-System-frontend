import React from "react";

export function VisaIcon({ className = "h-5 w-auto" }) {
  return (
    <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa">
      <rect width="48" height="32" rx="4" fill="#0A2540" />
      <path
        d="M19.4 21.6h-2.9l1.8-11.2h2.9l-1.8 11.2zm11.7-11c-.6-.2-1.5-.4-2.7-.4-3 0-5.1 1.6-5.1 3.8 0 1.7 1.5 2.6 2.7 3.2 1.2.6 1.6 1 1.6 1.5 0 .8-.9 1.2-1.8 1.2-1.2 0-1.9-.2-2.9-.6l-.4-.2-.4 2.5c.7.3 1.9.6 3.2.6 3.2 0 5.3-1.6 5.3-3.9 0-1.3-.8-2.3-2.6-3.1-1.1-.5-1.7-.9-1.7-1.4 0-.5.6-1 1.8-1 .9 0 1.6.2 2.2.5l.3.1.8-2.3zm7.6 0h-2.3c-.7 0-1.3.2-1.6 1l-4.5 10.2h3.1l.6-1.7h3.8l.4 1.7h2.8l-2.3-11.2zm-3.5 7.1l1.5-4.1.9 4.1h-2.4zm-13.8-7.1l-2.8 7.6-.3-1.5c-.5-1.7-2.1-3.6-3.9-4.5l2.5 9.6h3.1l4.6-11.2h-3.2z"
        fill="#FFFFFF"
      />
      <path
        d="M9.8 10.4H5.3l-.1.3c3.5.9 5.8 3.1 6.8 5.7l-1-5.1c-.2-.6-.6-.9-1.2-.9z"
        fill="#F7B600"
      />
    </svg>
  );
}

export function MastercardIcon({ className = "h-5 w-auto" }) {
  return (
    <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
      <rect width="48" height="32" rx="4" fill="#14171A" />
      <circle cx="18" cy="16" r="8" fill="#EB001B" />
      <circle cx="30" cy="16" r="8" fill="#F79E1B" fillOpacity="0.9" />
      <path
        d="M24 10.7a7.96 7.96 0 012.9 5.3 7.96 7.96 0 01-2.9 5.3 7.96 7.96 0 01-2.9-5.3 7.96 7.96 0 012.9-5.3z"
        fill="#FF5F00"
      />
    </svg>
  );
}

export function AmexIcon({ className = "h-5 w-auto" }) {
  return (
    <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="American Express">
      <rect width="48" height="32" rx="4" fill="#0077A6" />
      <text x="24" y="19" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5">
        AMEX
      </text>
    </svg>
  );
}

export default function PaymentSchemeBadges({ size = "md" }) {
  const iconClass = size === "sm" ? "h-6 w-auto" : size === "lg" ? "h-9 w-auto" : "h-7 w-auto";
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center justify-center rounded border border-slate-200 dark:border-white/10 p-0.5 shadow-sm bg-white dark:bg-black/40">
        <VisaIcon className={iconClass} />
      </div>
      <div className="flex items-center justify-center rounded border border-slate-200 dark:border-white/10 p-0.5 shadow-sm bg-white dark:bg-black/40">
        <MastercardIcon className={iconClass} />
      </div>
      <div className="flex items-center justify-center rounded border border-slate-200 dark:border-white/10 p-0.5 shadow-sm bg-white dark:bg-black/40">
        <AmexIcon className={iconClass} />
      </div>
    </div>
  );
}
