"use client";

import React from "react";
import { usePlatformConfig } from "../../hooks/usePlatformConfig";
import { ShieldCheck, Info } from "lucide-react";

/**
 * Declarative visibility wrapper for PayHere approval compliance.
 * When requireLive=true, children are rendered only when payhereApprovedLive === true.
 * When requireLive=false, children are rendered only when payhereApprovedLive === false (Review Mode).
 */
export const PayhereGate = ({
  children,
  requireLive = true,
  fallback = null,
  showReviewNotice = false,
  reviewNoticeText = "Feature temporarily unavailable.",
}) => {
  const { payhereApprovedLive, loading } = usePlatformConfig();

  if (loading) {
    return null; // Or lightweight placeholder while config loads
  }

  const isConditionMet = requireLive ? payhereApprovedLive : !payhereApprovedLive;

  if (isConditionMet) {
    return <>{children}</>;
  }

  if (showReviewNotice && requireLive && !payhereApprovedLive) {
    return (
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
        <Info className="w-4 h-4 shrink-0 text-amber-400" />
        <span>{reviewNoticeText}</span>
      </div>
    );
  }

  return fallback ? <>{fallback}</> : null;
};

export default PayhereGate;
