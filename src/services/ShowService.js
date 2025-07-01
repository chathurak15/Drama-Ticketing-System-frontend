import axios from "../api/axiosInstance";

export const getShows = ({ page = 0, size = 12, title, date, city, venue}) => {
  return axios.get("show/all", {
    params: {
      page,
      size,
      title: title,
      date: date,
      city: city,
      location: venue

    }
  });
};

export const getShowsAdmin = async ({ page = 0, size = 10, status = "all" }) => { 
  return axios.get("show/admin/all", {
    params: {
      page,
      size,
      status
    },
    withCredentials: true
  });
};

export const getShowById = (id) => {
  return axios.get(`show/${id}`);
  
};

export const getCity = async () => {
  const response = await axios.get(`/city/all`);
  return response.data;
};

export const getLocationByCity = async (id) => {
  const response = await axios.get(`/city/venue/${id}`);
  return response.data;
};

export const deleteShow = async ({showId,userId}) =>{
  return axios.delete(`/show/delete`, {
    params:{
      showId,
      id:userId
    }
  });
};

export const updateShowStatus = async ({ id, status }) => {
  const response = await axios.put(`/show/status`, null, {
    params: { id, status },
    withCredentials: true
  });
  return response.data;
};