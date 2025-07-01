import axios from "../api/axiosInstance";

export const getActors = ({ page = 0, size = 12, name}) => {
  return axios.get("actor/all", {
    params: {
      page,
      size,
      name,
    }
  });
};