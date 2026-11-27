import axios from "axios";

const getBaseUrl = () => {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
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
