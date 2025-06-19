import React from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/ShowCard.css";

const ShowCard = ({ show }) => {
  const navigate = useNavigate();

  return (
    <div className="show-card">
      <a href={`/show/${show.showId}`}>
      <div className="show-location">
        <i className="fas fa-map-marker-alt mr-1 text-red-500"></i>
        {show.city.cityName}
      </div>

      {/* Safely rendering image */}
      <img
        src={
          show.image
            ? `/public/images/upload/show/${show.image}`
            : "/images/default-show.jpg"
        } // Fallback image
        alt={show.title}
        className="show-image"
      />

      <h3 className="text-lg font-bold mt-2">{show.title}</h3>

      <p className="text-sm text-gray-600">
        {show.showDate} - {show.showTime}
      </p>

      <p className="text-sm text-gray-700">
        {show.city?.cityName} - {show.location}
      </p>

      <button
        onClick={() => navigate(`/show/${show.showId}`)}
        className="mt-3 bg-amber-600 text-white px-4 py-2 rounded"
      >
        Booking
      </button>
      </a>
    </div>
  );
};

export default ShowCard;
