// src/components/DramaCard.jsx
import React from 'react';
import './DramaCard.css';
import { Link } from 'react-router-dom';

const DramaCard = ({ drama }) => {
  return (
    <div className="drama-card">
      <a href={`/drama/${drama.id}`} className="drama-link">
      <img src={drama.image} alt={drama.title} />
      <h3>{drama.title}</h3>
      <p>{drama.rating}★</p>
<<<<<<< Updated upstream
      <Link to={`/drama/${drama.id}`} className="view-button">View Drama</Link>
=======
      <button className="view-button" onClick={handleViewDetails}> View Details </button>
      </a>
>>>>>>> Stashed changes
    </div>
  );
};

export default DramaCard;