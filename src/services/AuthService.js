import axios from "../api/axiosInstance";

export const login = (email, password) => {
  return axios.post(
    "auth/login",
    { email, password },
    {
      withCredentials: true,
    }
  );
};

export const verify2Fa = (challengeToken, otp) => {
  return axios.post(
    "auth/login/verify-2fa",
    { challengeToken, otp },
    {
      withCredentials: true,
    }
  );
};

export const resend2Fa = (challengeToken) => {
  return axios.post("auth/login/resend-2fa", { challengeToken });
};

export const initiate2FaSetup = (channel) => {
  return axios.post("auth/2fa/setup/initiate", { channel });
};

export const confirm2FaSetup = (challengeToken, otp) => {
  return axios.post("auth/2fa/setup/confirm", { challengeToken, otp });
};

export const disable2Fa = (password, otp) => {
  return axios.post("auth/2fa/disable", { password, otp });
};

export const unlockAccount = (token) => {
  return axios.post("auth/unlock-account", { token });
};

export const logout = () => {
  return axios.post(
    "auth/logout",
    {},
    {
      withCredentials: true,
    }
  );
};

export const register = (userData) => {
  return axios.post("auth/register", userData);
};

export const forgotPassword = (email) => {
  return axios.post("auth/forgot-password", { email });
};

export const resetPassword = (token, newPassword, confirmPassword) => {
  return axios.post("auth/reset-password", {
    token,
    newPassword,
    confirmPassword,
  });
};

export const changePassword = (currentPassword, newPassword, confirmPassword) => {
  return axios.post("auth/change-password", {
    currentPassword,
    newPassword,
    confirmPassword,
  });
};

export const getCurrentUser = () => {
  return axios.get("auth/me");
};

export const getPlatformConfig = () => {
  return axios.get("public/platform-config", { withCredentials: true });
};

export const updatePlatformSettings = async (settings) => {
  const payload = {};
  if (settings.payhereApprovedLive !== undefined) payload.payhereApprovedLive = settings.payhereApprovedLive;
  if (settings.payhereReviewMode !== undefined) payload.payhereReviewMode = settings.payhereReviewMode;
  if (settings.disablePublicSignupDuringReview !== undefined)
    payload.disablePublicSignupDuringReview = settings.disablePublicSignupDuringReview;

  try {
    return await axios.put("admin/settings/payhere-mode", payload, { withCredentials: true });
  } catch (err) {
    if (err.response?.status === 405) {
      return await axios.post("admin/settings/payhere-mode", payload, { withCredentials: true });
    }
    throw err;
  }
};

export const updatePayhereMode = async (payhereApprovedLive) => {
  return updatePlatformSettings({ payhereApprovedLive });
};

export default {
  login,
  verify2Fa,
  resend2Fa,
  initiate2FaSetup,
  confirm2FaSetup,
  disable2Fa,
  unlockAccount,
  logout,
  register,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  getPlatformConfig,
  updatePlatformSettings,
  updatePayhereMode,
};
