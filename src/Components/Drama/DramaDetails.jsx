import { useParams } from 'react-router-dom';
import React, { useState, useRef } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './DramaDetails.css';
import '../Shows/ShowsData'
import showsData from '../Shows/ShowsData';

const dramaList = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: 'Garu Katanayakathumani',
  rating: 4.8,
  category: i % 3 === 0 ? 'Newest' : 'Top Rated',
  image: `/images/drama${(i % 6) + 1}.jpg`
}));


const DramaDetails = () => {

  const { id } = useParams();
  const drama = dramaList.find(d => d.id === parseInt(id));

  if (!drama) return <p>Drama not found</p>;

  const [startIndex, setStartIndex] = useState(0);

  const visibleShows = showsData.slice(startIndex, startIndex + 4);

  const handleNext = () => {
    if (startIndex + 4 < showsData.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const reviews = [
    {
      name: "Supun Perera",
      date: "2025/06/08",
      rating: 5,
      text: "loved every moment of this drama! The performances were outstanding and the story was deeply moving.",
    },
    {
      name: "Pasangi",
      date: "2025/06/05",
      rating: 4,
      text: "Sriyantha Mendis delivered a stellar performance. The emotional depth of the story was incredible.",
    },
    {
      name: "Adithya",
      date: "2025/06/04",
      rating: 4.5,
      text: "Yashoda Wimaladharma's portrayal of the mother was heart-wrenching. A must-see for drama lovers.",
    },
    {
      name: "Jessy",
      date: "2025/06/01",
      rating: 5,
      text: "I laughed, I cried, and I was moved. This drama is a masterpiece of storytelling.",
    },
    {
      name: "Tharindu",
      date: "2025/05/30",
      rating: 1,
      text: "I don't like.",
    }
  ];
  const scrollRef = useRef();

  const scroll = (direction) => {
    if (direction === 'left') {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    } else {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };


  return (
    <>
      <Header />
      <br />
      <br />
      <div className="drama-page container mx-auto px-4 py-8">
        <div className="top-section">
          <img
            src={drama.image}
            className="drama-poster"
          />
          <div className="drama-details">
            <h1 className="drama-title">{drama.title} - Stage Drama</h1>
            <div className="drama-info">
              <span className="rating">⭐ {drama.rating}</span>
              <span className="duration">⏱ {drama.duration}</span>
            </div>
          </div>
        </div>
        <br />
        <br />
        <br />
        <br />
        <div className="description-section">
          <div className="description-text">
            <h2>Description</h2>
            <p>
              "Mama Nemeyi Wena Kenek" is a powerful stage drama that explores the
              struggles of a mother battling societal expectations and personal
              sacrifice. Set against a backdrop of cultural tension and emotional
              conflict, it delivers a poignant message about love, resilience, and
              the strength of maternal bonds.
            </p>
          </div>

          <div className="video-section">
            <iframe
              width="100%"
              height="250"
              src={drama.videoUrl || "https://www.youtube.com/embed/placeholder"}
              title="Mama Nemeyi Wena Kenek - Best Clips"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        <br />
        <br />
        <br />
        <br />
        <div className="cast-section">
          <h2>Cast</h2>
          <div className="cast-grid">
            {[
              { name: "Nadeesha Hemamali", image: "/images/cast1.jpeg" },
              { name: "Sajitha Anthony", image: "/images/cast2.jpeg" },
              { name: "Kumara Thirimadura", image: "/images/cast3.jpeg" },
              { name: "Sriyantha Mendis", image: "/images/cast4.jpeg" },
              { name: "Yashoda Wimaladharma", image: "/images/cast5.jpeg" },
              { name: "Mahendra Perera", image: "/images/cast6.jpeg" },
            ].map((cast, index) => (

              <div className="cast-card" key={index}>
                <img src={cast.image} className="cast-photo" />
                <p className="cast-name">{cast.name}</p>
              </div>

            ))}
          </div>
        </div>
        <br />
        <br />
        <br />
        <br />
        <div className="audience-reviews-section">
          <h2>Audience Reviews</h2>
          <div className="review-controls">
            <button className="arrow-btn" onClick={() => scroll('left')}>&lt;</button>
            <div className="reviews-container" ref={scrollRef}>
              {reviews.map((review, index) => (
                <div className="review-card" key={index}>
                  <div className="stars">
                    {'★'.repeat(Math.floor(review.rating)) + (review.rating % 1 !== 0 ? '' : '')}
                  </div>
                  <div className="review-meta">
                    <strong>{review.name}</strong>
                    <span>{review.date}</span>
                  </div>
                  <p className="review-text">{review.text}</p>
                </div>
              ))}
            </div>
            <br />
            <br />
            <br />
            <br />
            <button className="arrow-btn" onClick={() => scroll('right')}>&gt;</button>
          </div>
        </div>
        <div className="upcoming-section">
          <h2>Upcoming Shows</h2>
          <div className="slide-container">
            <button onClick={handlePrev} className="arrow-btn">←</button>
            <div className="card-slider">
              {visibleShows.map(show => (
                <div className="show-card" key={show.id}>
                  <div className="image-container">
                    <img src={show.image} alt={show.name} />
                    <div className="city-overlay">{show.city}</div>
                  </div>
                  <h3>{show.title}</h3>
                  <p>{show.date} | {show.time}</p>
                  <p className="location">{show.location}</p>
                  <button className="book-btn">Booking</button>
                </div>
              ))}
            </div>
            <button onClick={handleNext} className="arrow-btn">→</button>
          </div>
        </div>
        <br />
        <br />
        <br />
        <br />
      </div>
      <Footer />
    </>
  );
};

export default DramaDetails;