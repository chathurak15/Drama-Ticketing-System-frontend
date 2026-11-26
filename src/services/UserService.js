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

export const getUserFullDetails = async (id) => {
  return await axios.get(`user/${id}/full-details`, {
    withCredentials: true,
  });
};

export const updateUser = async (userData) => {
  return await axios.put("user/update", userData, {
    withCredentials: true,
  });
};

export const getMyProfile = async () => {
  return await axios.get("users/me", {
    withCredentials: true,
  });
};

export const updateMyProfile = async (profileData) => {
  return await axios.put("users/me", profileData, {
    withCredentials: true,
  });
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await axios.post("users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
};