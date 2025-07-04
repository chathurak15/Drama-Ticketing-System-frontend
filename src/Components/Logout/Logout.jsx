import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const hasRun = useRef(false); 

  useEffect(() => {
    if (hasRun.current) return; 
    hasRun.current = true;

    const performLogout = async () => {
      const confirmed = window.confirm("Are you sure you want to logout?");
      if (!confirmed) {
        navigate(-1);
        return;
      }

      try {
        await logout(); // await to ensure it's complete
        navigate("/login");
      } catch (err) {
        console.error("Logout failed", err);
      }
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <div className="text-center mt-10 text-lg text-gray-600">
      Logging out...
    </div>
  );
};

export default Logout;
