"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getPlatformConfig,
  updatePlatformSettings as apiUpdatePlatformSettings,
} from "../services/AuthService";
import { toast } from "react-toastify";

let globalConfigCache = {
  payhereApprovedLive: false,
  payhereReviewMode: true,
  disablePublicSignupDuringReview: false,
  loaded: false,
};

const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener({ ...globalConfigCache }));
};

const fetchAndSyncConfig = async () => {
  try {
    const res = await getPlatformConfig();
    const data = res?.data || {};
    const approvedLive = !!data.payhereApprovedLive;
    const reviewMode = data.payhereReviewMode !== undefined ? !!data.payhereReviewMode : !approvedLive;
    const disableSignup = !!data.disablePublicSignupDuringReview;

    globalConfigCache = {
      payhereApprovedLive: approvedLive,
      payhereReviewMode: reviewMode,
      disablePublicSignupDuringReview: disableSignup,
      loaded: true,
    };
    notifyListeners();
    return globalConfigCache;
  } catch (err) {
    console.warn("Could not fetch platform config:", err?.message || err);
    globalConfigCache = {
      payhereApprovedLive: false,
      payhereReviewMode: true,
      disablePublicSignupDuringReview: false,
      loaded: true,
    };
    notifyListeners();
    return globalConfigCache;
  }
};

const PlatformConfigContext = createContext({
  ...globalConfigCache,
  loading: true,
  refreshConfig: async () => {},
  setPayhereLiveMode: async () => {},
  setPayhereReviewMode: async () => {},
  setDisablePublicSignup: async () => {},
  updateSettings: async () => {},
});

export const PlatformConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(globalConfigCache);
  const [loading, setLoading] = useState(!globalConfigCache.loaded);

  useEffect(() => {
    const handleUpdate = (newConfig) => {
      setConfig(newConfig);
      setLoading(false);
    };

    listeners.add(handleUpdate);

    if (!globalConfigCache.loaded) {
      fetchAndSyncConfig().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Refresh on tab focus
    const onFocus = () => {
      fetchAndSyncConfig();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      listeners.delete(handleUpdate);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      const res = await apiUpdatePlatformSettings(newSettings);
      const data = res.data || {};
      const isLive = data.payhereApprovedLive !== undefined ? !!data.payhereApprovedLive : !!newSettings.payhereApprovedLive;
      const isReview = data.payhereReviewMode !== undefined ? !!data.payhereReviewMode : !isLive;
      const isDisableSignup = data.disablePublicSignupDuringReview !== undefined
        ? !!data.disablePublicSignupDuringReview
        : !!newSettings.disablePublicSignupDuringReview;

      globalConfigCache = {
        payhereApprovedLive: isLive,
        payhereReviewMode: isReview,
        disablePublicSignupDuringReview: isDisableSignup,
        loaded: true,
      };
      notifyListeners();

      if (newSettings.payhereReviewMode !== undefined || newSettings.payhereApprovedLive !== undefined) {
        toast.success(
          isLive
            ? "PayHere Live Mode Activated! Production checkout & payouts are now live."
            : "Switched to PayHere Review Mode (Sandbox routing active)."
        );
      } else if (newSettings.disablePublicSignupDuringReview !== undefined) {
        toast.info(
          isDisableSignup
            ? "Public account registration paused."
            : "Buyer registration re-enabled."
        );
      }

      return data;
    } catch (err) {
      console.error("Failed to update platform settings:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.status === 401
          ? "Session expired or not signed in. Please sign in as Administrator."
          : null) ||
        (err.response?.status === 403
          ? "Access Denied: Super Admin (ROLE_Admin) privileges required."
          : null) ||
        (err.response?.status === 404
          ? "Settings endpoint not found on server. Please ensure Spring Boot backend is updated."
          : null) ||
        (err.code === "ERR_NETWORK"
          ? "Cannot connect to backend server. Please verify Spring Boot is running on port 8080."
          : null) ||
        err.message ||
        "Failed to update platform settings.";
      toast.error(errorMsg);
      throw err;
    }
  }, []);

  const setPayhereLiveMode = useCallback((live) => updateSettings({ payhereApprovedLive: live, payhereReviewMode: !live }), [updateSettings]);
  const setPayhereReviewMode = useCallback((review) => updateSettings({ payhereReviewMode: review, payhereApprovedLive: !review }), [updateSettings]);
  const setDisablePublicSignup = useCallback((disable) => updateSettings({ disablePublicSignupDuringReview: disable }), [updateSettings]);

  const value = {
    payhereApprovedLive: config.payhereApprovedLive,
    payhereReviewMode: config.payhereReviewMode,
    disablePublicSignupDuringReview: config.disablePublicSignupDuringReview,
    loading,
    refreshConfig: fetchAndSyncConfig,
    setPayhereLiveMode,
    setPayhereReviewMode,
    setDisablePublicSignup,
    updateSettings,
  };

  return (
    <PlatformConfigContext.Provider value={value}>
      {children}
    </PlatformConfigContext.Provider>
  );
};

export const usePlatformConfig = () => {
  const context = useContext(PlatformConfigContext);
  // Fallback to global state if outside provider
  const [standaloneConfig, setStandaloneConfig] = useState(globalConfigCache);
  const [loading, setLoading] = useState(!globalConfigCache.loaded);

  useEffect(() => {
    if (context && context.refreshConfig) return;

    const handleUpdate = (newConfig) => {
      setStandaloneConfig(newConfig);
      setLoading(false);
    };

    listeners.add(handleUpdate);

    if (!globalConfigCache.loaded) {
      fetchAndSyncConfig().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const onFocus = () => fetchAndSyncConfig();
    window.addEventListener("focus", onFocus);

    return () => {
      listeners.delete(handleUpdate);
      window.removeEventListener("focus", onFocus);
    };
  }, [context]);

  if (context && context.refreshConfig) {
    return context;
  }

  const updateSettings = async (newSettings) => {
    try {
      const res = await apiUpdatePlatformSettings(newSettings);
      const data = res.data || {};
      const isLive = data.payhereApprovedLive !== undefined ? !!data.payhereApprovedLive : !!newSettings.payhereApprovedLive;
      const isReview = data.payhereReviewMode !== undefined ? !!data.payhereReviewMode : !isLive;
      const isDisableSignup = data.disablePublicSignupDuringReview !== undefined
        ? !!data.disablePublicSignupDuringReview
        : !!newSettings.disablePublicSignupDuringReview;

      globalConfigCache = {
        payhereApprovedLive: isLive,
        payhereReviewMode: isReview,
        disablePublicSignupDuringReview: isDisableSignup,
        loaded: true,
      };
      notifyListeners();

      if (newSettings.payhereReviewMode !== undefined || newSettings.payhereApprovedLive !== undefined) {
        toast.success(
          isLive
            ? "PayHere Live Mode Activated! Production checkout & payouts are now live."
            : "Switched to PayHere Review Mode (Sandbox routing active)."
        );
      } else if (newSettings.disablePublicSignupDuringReview !== undefined) {
        toast.info(
          isDisableSignup
            ? "Public account registration paused."
            : "Buyer registration re-enabled."
        );
      }

      return data;
    } catch (err) {
      console.error("Failed to update platform settings:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.status === 401
          ? "Session expired or not signed in. Please sign in as Administrator."
          : null) ||
        (err.response?.status === 403
          ? "Access Denied: Super Admin (ROLE_Admin) privileges required."
          : null) ||
        (err.response?.status === 404
          ? "Settings endpoint not found on server. Please ensure Spring Boot backend is updated."
          : null) ||
        (err.code === "ERR_NETWORK"
          ? "Cannot connect to backend server. Please verify Spring Boot is running on port 8080."
          : null) ||
        err.message ||
        "Failed to update platform settings.";
      toast.error(errorMsg);
      throw err;
    }
  };

  return {
    payhereApprovedLive: standaloneConfig.payhereApprovedLive,
    payhereReviewMode: standaloneConfig.payhereReviewMode,
    disablePublicSignupDuringReview: standaloneConfig.disablePublicSignupDuringReview,
    loading,
    refreshConfig: fetchAndSyncConfig,
    setPayhereLiveMode: (live) => updateSettings({ payhereApprovedLive: live, payhereReviewMode: !live }),
    setPayhereReviewMode: (review) => updateSettings({ payhereReviewMode: review, payhereApprovedLive: !review }),
    setDisablePublicSignup: (disable) => updateSettings({ disablePublicSignupDuringReview: disable }),
    updateSettings,
  };
};

export default usePlatformConfig;
