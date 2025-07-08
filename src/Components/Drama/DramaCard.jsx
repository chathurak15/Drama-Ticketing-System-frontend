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
    <div className="drama-card">
      <a href={`/drama/${drama.id}`} className="drama-link">
        <img
          src={
            drama.image
              ? `${BACKEND_IMAGE_URL}${drama.image}`
              : "/images/default.png"
          }
          alt={drama.title}
        />
        <h3>{drama.title}</h3>
        <p>{drama.rating}★</p>
      </a>
      <button className="view-button" onClick={handleViewDetails}>
        {" "}
        View Details{" "}
      </button>
    </div>
  );
};

export default DramaCard;
