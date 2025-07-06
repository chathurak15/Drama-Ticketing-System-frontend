import axios from "../api/axiosInstance";

export const addBooking = (bookingData) => {
  return axios.post("booking/add", bookingData, {
    withCredentials: true,
  });
};

export const getBooking = (ticketId) => {
  return axios.get("booking", {
    params: {
      ticketId: ticketId,
    },
    withCredentials: true,
  });
};

export const getBookingsByUserId = (userId) => {
  return axios.get("booking/all/byUser", {
    params: {
      userId: userId,
    },
    withCredentials: true,
  });
};

export const cancelBooking = (bookingId,userId) => {
  return axios.put("booking/cancel",{}, {
      params: {
        bookingId: bookingId,
        customerId: userId
      },
      withCredentials: true // if using Spring Security session cookies
    }
  );
};
