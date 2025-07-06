import axios from "../api/axiosInstance";

export const getUsers = ({page, size}) =>{
    return axios.get("user/all",{
        params:{
            page,
            size
        },
        withCredentials : true
    });
};

export const deleteUser = async (id) =>{
    return await axios.delete(`user/${id}`, {
      withCredentials : true
    });
}

export const updateStatus = (id, status) => {
  return axios.put("user/status",{},
    {
      params: {
        id,
        status,
      },
      withCredentials: true,
    }
  );
};

export const getUser = async () =>{
    return await axios.get("user/me", {
      withCredentials : true
    });
}

export const updateUser = async (userData) => {
  return await axios.put("user/update", userData, {
    withCredentials: true,
  });
}