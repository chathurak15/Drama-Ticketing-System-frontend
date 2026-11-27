import axios from "../api/axiosInstance";

export const getSeatsByShowId = (showId) => {
  return axios.get(`seat/seat-plan/${showId}`);
};

export const getUnavailableSeats = (showId, slot) => {
  const url = slot
    ? `seat/unavailable-seats/${showId}?slot=${encodeURIComponent(slot)}`
    : `seat/unavailable-seats/${showId}`;
  return axios.get(url);
};

export const getSeatAvailability = getUnavailableSeats;

export const lockSeats = async (bookingData) => {
  return await axios.post(`seat/lock`, bookingData, {
    withCredentials: true,
  });
};

export const getMyLock = (showId, slot) => {
  const url = slot
    ? `seat/my-lock?showId=${encodeURIComponent(showId)}&slot=${encodeURIComponent(slot)}`
    : `seat/my-lock?showId=${encodeURIComponent(showId)}`;
  return axios.get(url, { withCredentials: true });
};

export const releaseLock = (showId, slot) => {
  const url = slot
    ? `seat/lock?showId=${encodeURIComponent(showId)}&slot=${encodeURIComponent(slot)}`
    : `seat/lock?showId=${encodeURIComponent(showId)}`;
  return axios.delete(url, { withCredentials: true });
};
