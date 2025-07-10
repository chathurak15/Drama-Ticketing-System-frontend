import axios from "../api/axiosInstance";

 export const addReview = async (reviewData) => {
  return await axios.post("rating/add", reviewData,
    {
      withCredentials: true,
    }
  );
}