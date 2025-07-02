import axios from "../api/axiosInstance";

export const addDrama = (dramaData) => {
  return axios.post("drama/add", dramaData,{ 
    withCredentials : true
  });
};

export const getDramas = ({ page = 0, size = 12, title = '', sortByRating = 'desc' }) => {
  return axios.get("drama/all", {
    params: {
      page,
      size,
      title,
      sortByRating
    }
  });
};

export const getDramaById = (id) => {
  return axios.get(`drama/${id}`);
};

export const getRatings = (page=0, size=4, dramaId) => {
  return axios.get("rating/getByDrama",{
     params: {
      page,
      size,
      dramaId
    }
});
};

export const deleteDrama = async (id) => {
  try {
    const response = await axios.delete(`drama/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Delete drama failed:', error.response.data);
      throw new Error(error.response.data.message || 'Failed to delete drama');
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('Network error - no response from server');
    } else {
      console.error('Request setup error:', error.message);
      throw new Error('Failed to setup request');
    }
  }
};