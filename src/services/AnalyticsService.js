import axios from "../api/axiosInstance";

export const getAnalyticsSummary = (userId, timeRange = "6m") => {
  return axios.get("analytics/summary", {
    params: {
      userId,
      timeRange,
    },
    withCredentials: true,
  });
};
