import axios from "../api/axiosInstance";

export const addBooking = (bookingData) => {
  return axios.post("booking/add", bookingData, {
    withCredentials: true,
  });
};

export const initiatePayment = (payload) => {
  return axios.post("payment/initiate", payload, {
    withCredentials: true,
  });
};

export const initiatePayHerePayment = initiatePayment;

export const getBooking = (ticketId) => {
  return axios.get("booking", {
    params: {
      ticketId: ticketId,
    },
    withCredentials: true,
  });
};

export const getPartnerBooking = (ticketId) => {
  return axios.get("booking/partner", {
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

export const cancelBooking = (bookingId, userId) => {
  return axios.put("booking/cancel", {}, {
    params: {
      bookingId: bookingId,
      customerId: userId
    },
    withCredentials: true
  });
};

export const getBookingsByShow = (userId, page, size, showId = '', ticketId = '') => {
  return axios.get("booking/all/byShow", {
    params: {
      userId,
      page,
      size,
      showId,
      ticketId
    },
    withCredentials: true
  });
};

export const updateStatus = (bookingId, status) => {
  return axios.put("booking/status", [], {
    params: {
      bookingId,
      status
    },
    withCredentials: true
  });
};

export const getBookingReceipt = (ticketId) => {
  return axios.get("booking/receipt", {
    params: {
      ticketId: ticketId,
      id: ticketId,
    },
    withCredentials: true,
  });
};

export const getPreviewReceipt = () => {
  return axios.get("booking/receipt/preview", {
    withCredentials: true,
  });
};

export const downloadReceiptPdf = (ticketId) => {
  return axios.get(`booking/receipt/${ticketId}/pdf`, {
    responseType: "blob",
    withCredentials: true,
  });
};
