// src/components/DramaCard.jsx
import React from 'react';
import './DramaCard.css';
import { Link } from 'react-router-dom';

const DramaCard = ({ drama }) => {
  return (
    <div className="drama-card">
      <img src={drama.image} alt={drama.title} />
      <h3>{drama.title}</h3>
      <p>{drama.rating}★</p>
      <Link to={`/drama/${drama.id}`} className="view-button">View Drama</Link>
    </div>
  );
};

export default DramaCard;