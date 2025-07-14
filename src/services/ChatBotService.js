import axios  from "../api/axiosInstance";

export const getChatBot =  (message) => {
    return axios.post("chat", {message},{
        withCredentials:true
    });
};