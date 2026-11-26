import axiosInstance from "../api/axiosInstance";

/**
 * Upload a KYC verification document (NIC Front, NIC Back, BR Certificate, Bank Proof, Other KYC)
 * Generous 10MB limit; supports JPG, PNG, WEBP, PDF
 * Returns: { fileUrl, fileName, documentType, uploadedAt, ... }
 */
export const uploadKycDocument = async (file, documentType, customLabel = "") => {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  // Pre-validate client side for instant feedback
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("File exceeds 10MB limit. Please upload a smaller file.");
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp", ".pdf"].includes(ext)) {
      throw new Error("Only JPG, PNG, WEBP, or PDF files are allowed.");
    }
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);
  if (customLabel && customLabel.trim()) {
    formData.append("customLabel", customLabel.trim());
  }

  try {
    const response = await axiosInstance.post("organizer/kyc/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const serverMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "File upload failed. Please try again.";
    console.error("KYC upload error:", serverMessage);
    const customError = new Error(serverMessage);
    customError.response = error.response;
    throw customError;
  }
};

/**
 * Get all KYC documents uploaded by the authenticated organizer
 */
export const getMyKycDocuments = async () => {
  const response = await axiosInstance.get("organizer/kyc/documents", {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Get overall KYC status overview and document checklist
 */
export const getMyKycOverview = async () => {
  const response = await axiosInstance.get("organizer/kyc/overview", {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Update textual KYC details (NIC Number, BR Number)
 */
export const updateKycDetails = async ({ nicNumber, brNumber }) => {
  const response = await axiosInstance.post(
    "organizer/kyc/details",
    { nicNumber, brNumber },
    { withCredentials: true }
  );
  return response.data;
};

/**
 * Delete an uploaded KYC document by ID
 */
export const deleteKycDocument = async (documentId) => {
  const response = await axiosInstance.delete(`organizer/kyc/documents/${documentId}`, {
    withCredentials: true,
  });
  return response.data;
};

// --- ADMIN API CALLS ---

/**
 * Admin: Get all KYC documents for an organizer
 */
export const getOrganizerKycDocuments = async (organizerId) => {
  const response = await axiosInstance.get(`admin/kyc/organizer/${organizerId}/documents`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Admin: Get KYC overview for an organizer
 */
export const getOrganizerKycOverview = async (organizerId) => {
  const response = await axiosInstance.get(`admin/kyc/organizer/${organizerId}/overview`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Admin: Verify a single KYC document
 */
export const verifyKycDocument = async (documentId) => {
  const response = await axiosInstance.post(`admin/kyc/documents/${documentId}/verify`, null, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Admin: Reject a single KYC document with reason
 */
export const rejectKycDocument = async (documentId, reason) => {
  const response = await axiosInstance.post(
    `admin/kyc/documents/${documentId}/reject`,
    { reason },
    { withCredentials: true }
  );
  return response.data;
};

/**
 * Admin: Batch verify all pending documents
 */
export const verifyAllOrganizerKyc = async (organizerId) => {
  const response = await axiosInstance.post(`admin/kyc/organizer/${organizerId}/verify-all`, null, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Admin: Batch reject all documents with reason
 */
export const rejectAllOrganizerKyc = async (organizerId, reason) => {
  const response = await axiosInstance.post(
    `admin/kyc/organizer/${organizerId}/reject-all`,
    { reason },
    { withCredentials: true }
  );
  return response.data;
};
