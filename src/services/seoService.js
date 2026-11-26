import axios from "../api/axiosInstance";

export const pingSeoIndex = async (payload) => {
  try {
    return await axios.post("seo/ping-index", payload);
  } catch (e) {
    console.debug("SEO indexing notice:", e);
    return null;
  }
};

export const getSitemapData = async () => {
  return await axios.get("seo/sitemap");
};
