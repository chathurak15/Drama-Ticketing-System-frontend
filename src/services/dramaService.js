import axios from "../api/axiosInstance";

export const getDramas = ({ page = 0, size = 12, title = '', sortByRating = 'desc' }) => {
  return axios.get("drama/all", {
    params: {
      page,
      size,
      title,
      sortByRating
    }
  });
};

export const getDramaById = (id) => {
  return axios.get(`drama/${id}`);
};

export const getRatings = (page=0, size=4, dramaId) => {
  return axios.get("rating/getByDrama",{
     params: {
      page,
      size,
      dramaId
    }
});
}