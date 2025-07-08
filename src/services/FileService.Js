import axiosInstance from "../api/axiosInstance";

export const uploadFile = async (file, category, title) => {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category); 
  formData.append("title", title);

  try {
    const response = await axiosInstance.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("File upload failed:", error);
    throw error;
  }
};