"use client";
import React from "react";

import "../../assets/css/ShowCard.css";
import Link from "next/link";
import { getCdnUrl } from "../../utils/cdn.js";


const ShowCard = ({ show }) => {
  const BACKEND_IMAGE_URL = `${import.meta.env.VITE_CDN_URL}/shows/`;

return (
  <div className="show-card">
    <Link href={`/show/${show.slug || show.showId}`}>
      <div className="show-location">
        <i className="fas fa-map-marker-alt mr-1 text-red-500"></i>
        {show.city?.cityName}
      </div>

      <img
        src={
          show.image
            ? getCdnUrl(show.image, "shows")
            : "/assets/hero.png"
        }
        alt={show.title}
        className="show-image"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/assets/hero.png";
        }}
      />

      <h3 className="text-lg font-bold mt-2">{show.title}</h3>

      <p className="text-sm text-gray-600">
        {show.showDate} - {show.showTime}
      </p>

      <p className="text-sm text-gray-700">
        {show.city?.cityName} - {show.location}
      </p>

      <div className="mt-3 booking-btn text-white px-4 py-2 rounded text-center">
        Booking
      </div>
    </Link>
  </div>
  );
};

export default ShowCard;
