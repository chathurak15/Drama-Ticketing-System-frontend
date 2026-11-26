import axios from "../api/axiosInstance";

/**
 * Fetch all available commission models (Admin only)
 */
export const getCommissionModels = () => {
  return axios.get("admin/commission-models", {
    withCredentials: true,
  });
};

/**
 * Update commission model fees and/or toggle active status (Admin only)
 */
export const updateCommissionModel = (id, data) => {
  return axios.put(`admin/commission-models/${id}`, data, {
    withCredentials: true,
  });
};

/**
 * Fetch active commission model (Public checkout & contract generator)
 */
export const getActiveCommission = () => {
  return axios.get("public/active-commission", {
    withCredentials: true,
  });
};

export default {
  getCommissionModels,
  updateCommissionModel,
  getActiveCommission,
};
