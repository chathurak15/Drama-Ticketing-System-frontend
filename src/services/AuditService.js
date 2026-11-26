import axios from "../api/axiosInstance";

export const getAuditLogs = async ({ page = 0, size = 20, entityType = "", action = "", search = "" }) => {
  return await axios.get("audit/logs", {
    params: {
      page,
      size,
      entityType: entityType || undefined,
      action: action || undefined,
      search: search || undefined,
    },
    withCredentials: true,
  });
};

export const getAuditStats = async () => {
  return await axios.get("audit/stats", {
    withCredentials: true,
  });
};
