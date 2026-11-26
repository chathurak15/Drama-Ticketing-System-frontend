import axios from "../api/axiosInstance";

/**
 * Fetch unsigned live agreement preview with active commission rates
 */
export const getAgreementPreview = () => {
  return axios.get("organizer/agreements/preview", {
    withCredentials: true,
  });
};

/**
 * Sign and lock agreement with snapshot terms
 */
export const signAgreement = (payload) => {
  return axios.post("organizer/agreements/sign", payload, {
    withCredentials: true,
  });
};

/**
 * Get all signed agreements for the authenticated organizer (Active first, then past versions)
 */
export const getMyAgreements = () => {
  return axios.get("organizer/agreements", {
    withCredentials: true,
  });
};

/**
 * Get details of a single agreement by contractId
 */
export const getAgreementDetails = (contractId) => {
  return axios.get(`organizer/agreements/${contractId}`, {
    withCredentials: true,
  });
};

/**
 * Download signed agreement PDF for organizer
 */
export const downloadAgreementPdf = (contractId) => {
  return axios.get(`organizer/agreements/${contractId}/pdf`, {
    responseType: "blob",
    withCredentials: true,
  });
};

/**
 * Admin: Search and filter agreements across all organizers
 */
export const getAllAgreementsForAdmin = (status = "", search = "") => {
  const params = {};
  if (status && status !== "ALL") params.status = status;
  if (search && search.trim()) params.search = search.trim();

  return axios.get("admin/agreements", {
    params,
    withCredentials: true,
  });
};

/**
 * Admin: Download signed agreement PDF
 */
export const downloadAdminAgreementPdf = (contractId) => {
  return axios.get(`admin/agreements/${contractId}/pdf`, {
    responseType: "blob",
    withCredentials: true,
  });
};
