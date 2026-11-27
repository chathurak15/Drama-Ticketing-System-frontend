import { toast } from "react-toastify";

/**
 * Modern user-friendly popup notification helper for Naataka LK
 */
export const notify = {
  success: (message, options = {}) => {
    return toast.success(message, {
      ...options,
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      ...options,
    });
  },

  warn: (message, options = {}) => {
    return toast.warn(message, {
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return toast.warn(message, {
      ...options,
    });
  },

  info: (message, options = {}) => {
    return toast.info(message, {
      ...options,
    });
  },

  /**
   * Automatically extracts and displays friendly error messages from Axios or JS errors
   */
  apiError: (err, defaultMsg = "Something went wrong. Please try again.") => {
    let msg = defaultMsg;
    if (err) {
      if (typeof err === "string") {
        msg = err;
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (typeof err.response?.data === "string" && err.response.data.trim().length > 0 && err.response.data.length < 200) {
        msg = err.response.data;
      } else if (err.message && !err.message.includes("status code")) {
        msg = err.message;
      }
    }
    return toast.error(msg);
  },
};

export default notify;
