import axios from "../api/axiosInstance";

export const requestBuyerRefund = (bookingId, refundData) => {
  return axios.post(`buyer/bookings/${bookingId}/refund-request`, refundData, {
    withCredentials: true,
  });
};

export const getMyRefundRequests = () => {
  return axios.get(`buyer/refunds/my`, {
    withCredentials: true,
  });
};

export const getAllRefundsAdmin = () => {
  return axios.get(`admin/refunds/all`, {
    withCredentials: true,
  });
};

export const processRefundAdmin = (refundId, processData) => {
  return axios.post(`admin/refunds/${refundId}/process`, processData, {
    withCredentials: true,
  });
};

export const manualRefundBookingAdmin = (bookingId, manualData) => {
  return axios.post(`admin/bookings/${bookingId}/manual-refund`, manualData, {
    withCredentials: true,
  });
};
