import axios from "../api/axiosInstance";

export const getSeatsByShowId = (showId) => {
  return axios.get(`seat/seat-plan/${showId}`, {
  });
}

export const getUnavailableSeats = (showId) => {
  return axios.get(`seat/unavailable-seats/${showId}`, {
  });
}

export const lockSeats = async (bookingData) => {
  return await axios.post(`seat/lock-seats`, bookingData,{
    withCredentials: true
  });
}