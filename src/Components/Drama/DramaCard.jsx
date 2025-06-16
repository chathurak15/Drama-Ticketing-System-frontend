import React, { use } from 'react';
import './DramaCard.css';
import { useNavigate } from 'react-router-dom';


const DramaCard = ({ drama }) => {

  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/drama/${drama.id}`);
  }

  return (
    <div className="drama-card">
      <img src={drama.image} alt={drama.title} />
      <h3>{drama.title}</h3>
      <p>{drama.rating}★</p>
      <button className="view-button" onClick={handleViewDetails}> View Details </button>
    </div>
  );
};

export default DramaCard;