import axios from "../api/axiosInstance";

export const login = (email, password) => {
  return axios.post("auth/login", 
    {email,password},
    {
      withCredentials: true, 
    });
};

// Additional auth functions you might need
export const logout = () => {
  return axios.post("auth/logout");
};

export const register = (userData) => {
  return axios.post("auth/register", userData);
};

export const refreshToken = () => {
  return axios.post("auth/refresh");
};

export const forgotPassword = (email) => {
  return axios.post("auth/forgot-password", { email });
};

export const resetPassword = (token, newPassword) => {
  return axios.post("auth/reset-password", { token, newPassword });
};

export const getCurrentUser = () => {
  return axios.get("auth/me");
};

// Token management utilities
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

// Initialize auth token on app start
export const initializeAuth = () => {
  const token = getAuthToken();
  if (token) {
    setAuthToken(token);
  }
};

export default {
  login,
  logout,
  register,
  refreshToken,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  setAuthToken,
  getAuthToken,
  isAuthenticated,
  initializeAuth
};