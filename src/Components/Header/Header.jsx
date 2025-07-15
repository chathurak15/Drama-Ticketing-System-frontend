import React, { useState } from "react";
import Links from "../Links/Links";
import logo from "../../assets/logo nataka white.png";
import "../../assets/css/Header.css";
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className={`nav-bar ${isHome ? "nav-bar transparent" : ""}`}>
        <div className="container mx-auto flex justify-between items-center px-4 py-2 relative">
          <div className="nav-logo">
            <img src={logo} className="h-5 w-auto" alt="Logo" />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex">
            <Links />
          </div>

          {/* Mobile Hamburger Icon */}
          <button
            className="md:hidden text-white z-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>

          {/* Mobile Dropdown */}
          {menuOpen && (
            <div className="absolute top-full left-0 w-full bg-black text-white p-4 shadow-lg z-40 md:hidden">
              <Links />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;
