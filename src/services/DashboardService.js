import axios from "../api/axiosInstance";

export const getAdminDashboardStats = async () => {
  return await axios.get("dashboard/stats",{
    withCredentials:true
  });
};
