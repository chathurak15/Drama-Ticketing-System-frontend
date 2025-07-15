import axios from "../api/axiosInstance";

export const getAdminDashboardStats = async () => {
  return await axios.get("admin/dashboard/stats",{
    withCredentials:true
  });
};
