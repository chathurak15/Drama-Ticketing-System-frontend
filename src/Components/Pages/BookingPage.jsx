import React from 'react';
import { useParams } from 'react-router-dom';
import showsData from '../Shows/showsData';
import './BookingPage.css';

const BookingPage = () => {
  const { id } = useParams();
  const show = showsData.find((s) => s.id.toString() === id);

  if (!show) return <p>Show not found</p>;

  return (
    <div className="booking-page">
      <h2>{show.title}</h2>
      <img src={show.image} alt={show.title} />
      <p><strong>Date:</strong> {show.date}</p>
      <p><strong>Time:</strong> {show.time}</p>
      <p><strong>City:</strong> {show.city}</p>
      <p><strong>Location:</strong> {show.location}</p>
    </div>
  );
};

export default BookingPage;