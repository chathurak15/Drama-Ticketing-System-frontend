import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://server-nataka.chathurakavindu.me/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;