import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ShowCard.css';

const ShowCard = ({ show }) => {
  const navigate = useNavigate();

  return (
    <div className="show-card">
      <div className="show-location">📍 {show.location}</div>
      <img src={show.image} alt={show.title} className="show-image" />
      <h3>{show.title}</h3>
      <p>{show.date} - {show.time}</p>
      <p>{show.city} - {show.location}</p>
      <button onClick={() => navigate(`/booking/${show.id}`)}>Booking</button>
    </div>
  );
};

export default ShowCard;