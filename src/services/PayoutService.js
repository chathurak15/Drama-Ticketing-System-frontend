import axios from "../api/axiosInstance";

export const getPayoutSummary = (userId) => {
  return axios.get(`payout/summary/${userId}`, {
    withCredentials: true,
  });
};

export const getKycAgreement = (userId) => {
  return axios.get(`payout/kyc-agreement/${userId}`, {
    withCredentials: true,
  });
};

export const submitKycAgreement = (userId, kycData) => {
  return axios.post(`payout/submit-kyc-agreement/${userId}`, kycData, {
    withCredentials: true,
  });
};

export const requestPayout = (userId, payoutData) => {
  return axios.post(`payout/request/${userId}`, payoutData, {
    withCredentials: true,
  });
};

export const getMyPayoutRequests = (userId) => {
  return axios.get(`payout/my-requests/${userId}`, {
    withCredentials: true,
  });
};

export const getAllPayoutsForAdmin = () => {
  return axios.get(`payout/admin/all`, {
    withCredentials: true,
  });
};

export const updatePayoutStatus = (id, updateData) => {
  return axios.put(`payout/admin/${id}/status`, updateData, {
    withCredentials: true,
  });
};

export const downloadPayoutReceiptPdf = (id) => {
  return axios.get(`payout/${id}/receipt/pdf`, {
    responseType: "blob",
    withCredentials: true,
  });
};

// --- Milestone Two-Tranche Payout System ---

export const getShowTrancheEligibility = (showId) => {
  return axios.get(`payout/tranches/eligibility/${showId}`, {
    withCredentials: true,
  });
};

export const requestPayoutTranche = (userId, trancheData) => {
  return axios.post(`payout/tranches/request/${userId}`, trancheData, {
    withCredentials: true,
  });
};

export const uploadShowVerificationDoc = (showId, organizerId, docType, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(
    `payout/tranches/${showId}/upload-doc?organizerId=${organizerId}&docType=${docType}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    }
  );
};

export const getMyTranches = (organizerId) => {
  return axios.get(`payout/tranches/my/${organizerId}`, {
    withCredentials: true,
  });
};

export const downloadTrancheReceiptPdf = (trancheId) => {
  return axios.get(`payout/tranches/receipt/${trancheId}/pdf`, {
    responseType: "blob",
    withCredentials: true,
  });
};

export const getAllTranchesForAdmin = () => {
  return axios.get(`payout/tranches/admin/all`, {
    withCredentials: true,
  });
};

export const releaseTranche = (trancheId, adminId, releaseData) => {
  return axios.post(
    `payout/tranches/admin/${trancheId}/release?adminId=${adminId || 1}`,
    releaseData,
    { withCredentials: true }
  );
};

export const updateTrancheStatus = (trancheId, adminId, status, remarks) => {
  return axios.put(
    `payout/tranches/admin/${trancheId}/status?adminId=${adminId || 1}&status=${status}${remarks ? `&remarks=${encodeURIComponent(remarks)}` : ""}`,
    {},
    { withCredentials: true }
  );
};

export const updateTrancheBankAccount = (trancheId, bankData, adminId) => {
  return axios.put(
    `payout/tranches/admin/${trancheId}/bank-account?adminId=${adminId || 1}`,
    bankData,
    { withCredentials: true }
  );
};

export const verifyShowDoc = (docId, adminId) => {
  return axios.put(
    `payout/tranches/admin/docs/${docId}/verify?adminId=${adminId || 1}`,
    {},
    { withCredentials: true }
  );
};

export const rejectShowDoc = (docId, adminId, reason) => {
  return axios.put(
    `payout/tranches/admin/docs/${docId}/reject?adminId=${adminId || 1}&reason=${encodeURIComponent(reason || "")}`,
    {},
    { withCredentials: true }
  );
};

export const getShowProofsForAdmin = () => {
  return axios.get(`payout/tranches/admin/show-proofs`, {
    withCredentials: true,
  });
};

export const updateShowPayoutPlan = (showId, payoutPlan, advanceCapPercentage, adminId) => {
  return axios.patch(
    `payout/tranches/admin/shows/${showId}/payout-plan?adminId=${adminId || 1}`,
    { payoutPlan, advanceCapPercentage: advanceCapPercentage || 50.0 },
    { withCredentials: true }
  );
};
