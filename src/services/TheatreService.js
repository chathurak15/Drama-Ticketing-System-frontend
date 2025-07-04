import { Theater } from "lucide-react";
import axios from "../api/axiosInstance";

export const addTheatre = (theatreData, userId) => {
    return axios.post(`/theatre/permanent/${userId}`,theatreData,{ 
        withCredentials : true
    });
};

export const getSeatTypesByTheatreId = (id) =>{
    return axios.get(`theatre/seat-types/${id}`,{
        withCredentials : true
    })
}

export const getTheatresByUserId = (id)=>{
    return axios.get(`theatre/all/${id}`,{
        withCredentials:true
    })
}