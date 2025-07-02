import axios from "../api/axiosInstance";

export const login = (email, password) => {
  return axios.post("auth/login", 
    {email,password},
    {
      withCredentials: true, 
    });
};

export const logout = () => {
  return axios.post("auth/logout",{},{
    withCredentials : true
  });
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


// export const getAuthToken = () => {
//   return localStorage.getItem('authToken');
// };

// export const isAuthenticated = () => {
//   const token = getAuthToken();
//   return !!token;
// };

export default {
  login,
  logout,
  register,
  refreshToken,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  // getAuthToken,
  // isAuthenticated,
};