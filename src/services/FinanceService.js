import axios from "../api/axiosInstance";

export const getAdminPayments = async ({ page = 0, size = 20, status = "", search = "" }) => {
  return await axios.get("admin/finance/payments", {
    params: {
      page,
      size,
      status: status || undefined,
      search: search || undefined,
    },
    withCredentials: true,
  });
};

export const getFinanceSummary = async ({ startDate = "", endDate = "" } = {}) => {
  return await axios.get("admin/finance/summary", {
    params: {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
    withCredentials: true,
  });
};
