import React, { useState, useRef, useEffect } from "react";
import MenuItem from "../MenuItem/MenuItem";
import languageIcon from "/images/internet.png";
import useTranslation from "../../hooks/useTranslation";

function Links() {
  const { translatedTexts, language, setLanguage } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowDropdown(false);
  };

  return (
    <div className="flex items-center space-x-8 text-white relative" ref={dropdownRef}>
      <MenuItem linktext={translatedTexts?.nav?.home || "Home"} linkurl="/" />
      <MenuItem linktext={translatedTexts?.nav?.shows || "Shows"} linkurl="/shows" />
      <MenuItem linktext={translatedTexts?.nav?.dramas || "Dramas"} linkurl="/dramas" />
      <MenuItem linktext={translatedTexts?.nav?.terms || "Terms"} linkurl="/terms" />
      <MenuItem linktext={translatedTexts?.nav?.contact || "Contact Us"} linkurl="/contact" />
      <MenuItem
        linktext={translatedTexts?.nav?.login || "Login"}
        linkurl="/login"
        isButton={true}
      />
      <MenuItem
        linktext={translatedTexts?.nav?.register || "Register"}
        linkurl="/register"
        isButton={true}
      />

      <button
        id="languagebtn"
        className="cursor-pointer"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-haspopup="true"
        aria-expanded={showDropdown}
        aria-label="Select Language"
      >
        <img src={languageIcon} className="h-9 w-auto" alt="Select Language" />
      </button>

      {showDropdown && (
        <ul className="absolute right-0 mt-2 bg-white text-black rounded shadow-md w-32 z-50">
          <li
            className={`cursor-pointer px-4 py-2 hover:bg-gray-200 ${
              language === "en" ? "font-bold" : ""
            }`}
            onClick={() => handleLanguageChange("en")}
          >
            English
          </li>
          <li
            className={`cursor-pointer px-4 py-2 hover:bg-gray-200 ${
              language === "si" ? "font-bold" : ""
            }`}
            onClick={() => handleLanguageChange("si")}
          >
            සිංහල
          </li>
          <li
            className={`cursor-pointer px-4 py-2 hover:bg-gray-200 ${
              language === "ta" ? "font-bold" : ""
            }`}
            onClick={() => handleLanguageChange("ta")}
          >
            தமிழ்
          </li>
        </ul>
      )}
    </div>
  );
}

export default Links;
