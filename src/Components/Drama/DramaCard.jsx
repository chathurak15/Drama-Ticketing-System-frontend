"use client";
import React from "react";
import "../../assets/css/DramaCard.css";
import { useNavigate } from "../../utils/useNavigateCompat";
import { getCdnUrl } from "../../utils/cdn";
import Link from "next/link";

const DramaCard = ({ drama }) => {
  const navigate = useNavigate();
  const BACKEND_IMAGE_URL = `${import.meta.env.VITE_CDN_URL}/dramas/`;

  const handleViewDetails = () => {
    navigate(`/drama/${drama.id}`);
  };

  return (
  <div className="drama-card w-full rounded-lg overflow-hidden bg-white shadow-sm flex flex-col items-center p-2">
    <Link href={`/drama/${drama.id}`} className="drama-link w-full flex flex-col items-center">
      <img
        src={
          drama.image
            ? getCdnUrl(drama.image, "dramas")
            : "/assets/hero.png"
        }
        alt={drama.title}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/assets/hero.png";
        }}
        className="w-full object-cover rounded-lg mb-2"
        style={{ height: '250px', maxHeight: '40vw', minHeight: '200px' }}
      />
      <h3 className="text-base sm:text-lg font-semibold text-center mb-1 line-clamp-2">{drama.title}</h3>
      <p className="text-sm text-gray-600 mb-2">{drama.rating.toFixed(1)}★</p>
    </Link>

    <button
      className="view-button bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 w-full sm:w-auto text-base transition"
      onClick={handleViewDetails}
    >
      View Details
    </button>
  </div>
  );
};

export default DramaCard;
