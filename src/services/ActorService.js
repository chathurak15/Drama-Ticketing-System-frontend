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

export const addActor = (actorData)=>{
  return axios.post("actor/add", actorData,{
    withCredentials: true
  });
};

export const deleteActor = async (id) => { 
  return axios.delete(`actor/${id}`, {
    withCredentials: true
  });
}