import React, { useEffect } from "react";
import Links from "../Links/Links";
import logo from "../../assets/logo nataka white.png";
import "./Header.css";
import { useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      <div className={`nav-bar ${isHome ? "nav-bar transparent" : ""}`}>
        <div className="container mx-auto flex justify-between px-4 py-2">
          <div className="nav-logo">
            <img src={logo} className="h-5 w-auto" />
          </div>
          <Links />
        </div>
      </div>
    </>
  );
}

export default Header;
