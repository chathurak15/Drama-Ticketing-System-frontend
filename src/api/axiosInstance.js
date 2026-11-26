import axios from "axios";

const getBaseUrl = () => {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  } catch (e) {
    // import.meta may not be available in non-module environments
  }
  return "https://server-nataka.chathurakavindu.me/api/v1/";
};

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Response interceptor for security & handling session expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUserMeCheck = error.config?.url?.includes("user/me");
    if (error.response?.status === 401 && !isUserMeCheck && typeof window !== "undefined") {
      // Unauthorized or expired session
      console.warn("Session expired or unauthorized request");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
