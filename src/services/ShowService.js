import axios from "../api/axiosInstance";
// import showsData from "../Components/Shows/ShowsData";

export const addShow = (showData) => {
  return axios.post("show/add", showData,{
    withCredentials:true 
  })
}
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
  const response = await axios.get(`city/all`);
  return response.data;
};


export const getLocationByCity = async (id) => {
  const response = await axios.get(`city/venue/${id}`);
  return response.data;
};

export const deleteShow = async (showId,id) =>{
  return axios.delete("show/delete", {
    params:{
      showId,
      id
    },
    withCredentials:true
  });
};

export const updateShowStatus = async ({ id, status }) => {
  const response = await axios.put(`/show/status`, null, {
    params: { id, status },
    withCredentials: true
  });
  return response.data;
};

export const getShowsByUser = async ({ page = 0, size = 10, title="", status, userId}) => { 
  return axios.get("show/all/user", {
    params: {
      page,
      size,
      title,
      status,
      userId
    },
    withCredentials: true
  });
};