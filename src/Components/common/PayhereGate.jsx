"use client";

import React from "react";
import { usePlatformConfig } from "../../hooks/usePlatformConfig";
import { Info } from "lucide-react";

export const PayhereGate = ({
  children,
  requireLive = true,
  fallback = null,
  showReviewNotice = false,
  reviewNoticeText = "Feature temporarily unavailable.",
}) => {
  const { payhereApprovedLive, loading } = usePlatformConfig();

  if (loading) {
    return null;
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
