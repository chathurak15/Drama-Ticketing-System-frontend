import React from "react";
// import { useNavigate } from "react-router-dom";
import "../../assets/css/ShowCard.css";
import { Link } from "react-router-dom";


const ShowCard = ({ show }) => {
  const BACKEND_IMAGE_URL = "https://d3ay14vkclriu.cloudfront.net/uploads/shows/";

return (
  <div className="show-card">
    <Link to={`/show/${show.showId}`}>
      <div className="show-location">
        <i className="fas fa-map-marker-alt mr-1 text-red-500"></i>
        {show.city?.cityName}
      </div>

      <img
        src={
          show.image
            ? `${BACKEND_IMAGE_URL}${show.image}`
            : "/images/default.png"
        }
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

      <div className="mt-3 booking-btn text-white px-4 py-2 rounded text-center">
        Booking
      </div>
    </Link>
  </div>
  );
};

export default ShowCard;
