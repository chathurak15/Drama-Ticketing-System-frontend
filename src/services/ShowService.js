import axios from "../api/axiosInstance";

export const getShows = ({ page = 0, size = 12, title, date, city}) => {
  return axios.get("show/all", {
    params: {
      page,
      size,
      title: title,
      date: date,
      city: city,
    }
  });
};


export const getShowById = (id) => {
  return axios.get(`show/${id}`);
  
};

export const getCity = async () => {
  const response = await axios.get(`/city/all`);
  return response.data;
};