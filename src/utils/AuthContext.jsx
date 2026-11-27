"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { getUser } from "../services/UserService";
import { logout as logoutService } from "../services/AuthService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    // Check if visitor has previously signed in before sending request to backend
    if (typeof window !== "undefined" && localStorage.getItem("nataka_logged_in") !== "true") {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await getUser();
      setUser(response.data);
      if (typeof window !== "undefined") {
        localStorage.setItem("nataka_logged_in", "true");
      }
    } catch (error) {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("nataka_logged_in");
      }
      // 401 simply means visitor is an unauthenticated guest
      if (error?.response?.status !== 401) {
        console.warn("Failed to fetch user:", error?.message || error);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (e) {
      console.warn("Logout request completed with warning:", e?.message || e);
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("nataka_logged_in");
        sessionStorage.removeItem("nataka_booking");
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
