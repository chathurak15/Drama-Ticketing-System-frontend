import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/AuthService";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      const confirmed = window.confirm("Are you sure you want to logout?");
      if (!confirmed) {
        navigate(-1);
        return;
      }

      try {
        await logout(); 
      } catch (err) {
        console.error("Logout failed", err);
      }

      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="text-center mt-10 text-lg text-gray-600">
      Logging out...
    </div>
  );
};

export default Logout;
