import axios from "../api/axiosInstance";

export const addBooking = (bookingData) => {
  return axios.post("booking/add", bookingData,{ 
    withCredentials : true
  });
};
