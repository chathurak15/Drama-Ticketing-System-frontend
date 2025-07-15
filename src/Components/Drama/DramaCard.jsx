import React from "react";
import "../../assets/css/DramaCard.css";
import { useNavigate } from "react-router-dom";

const DramaCard = ({ drama }) => {
  const navigate = useNavigate();
  const BACKEND_IMAGE_URL = "http://localhost:8080/uploads/dramas/";

  const handleViewDetails = () => {
    navigate(`/drama/${drama.id}`);
  };

  return (
    <div className="drama-card w-full rounded-lg overflow-hidden bg-white shadow-sm flex flex-col items-center p-2">
      <a href={`/drama/${drama.id}`} className="drama-link w-full flex flex-col items-center">
        <img
          src={
            drama.image
              ? `${BACKEND_IMAGE_URL}${drama.image}`
              : "/images/default.png"
          }
          alt={drama.title}
          className="w-full object-cover rounded-lg mb-2"
          style={{ height: '250px', maxHeight: '40vw', minHeight: '200px' }}
        />
        <h3 className="text-base sm:text-lg font-semibold text-center mb-1 line-clamp-2">{drama.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{drama.rating.toFixed(1)}★</p>
      </a>
      <button className="view-button bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 w-full sm:w-auto text-base transition" onClick={handleViewDetails}>
        View Details
      </button>
    </div>
  );
};

export default DramaCard;
