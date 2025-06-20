import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation

const upcomingShows = [
  {
    id: 1,
    image: "/images/upload/show/drama7.jpg",
    title: "Mama Nemeyi Wena Kenek – Colombo Premiere",
    date: "October 26, 2025",
    time: "7:00 PM",
    venue: "Lionel Wendt Theatre",
  },
  {
    id: 2,
    image: "/images/drama3.jpg",
    title: "ගුරු තරු",
    date: "November 3, 2025",
    time: "6:30 PM",
    venue: "Nelum Pokuna Theatre",
  },
   {
    id: 3,
   image: "/images/upload/show/drama7.jpg",
    title: "Mama Nemeyi Wena Kenek – Colombo Premiere",
    date: "October 26, 2025",
    time: "7:00 PM",
    venue: "Lionel Wendt Theatre",
  },
  {
    image: "/images/drama3.jpg",
    title: "ගුරු තරු",
    date: "November 3, 2025",
    time: "6:30 PM",
    venue: "Nelum Pokuna Theatre",
  },
  {
    image: "/images/drama4.jpg",
    title: "පිරිමියෙක්ගෙන් පැමිණිල්ලක්",
    date: "November 10, 2025",
    time: "6:00 PM",
    venue: "Town Hall Theatre",
  },
];

const UpcomingShowsSlider = () => {
  const sliderRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current && !isHovered) {
        sliderRef.current.scrollBy({
          left: 280,
          behavior: "smooth",
        });
      }
    }, 2000); // Adjust scroll interval for better experience
    return () => clearInterval(interval);
  }, [isHovered]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -280,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: 280,
        behavior: "smooth",
      });
    }
  };

  const handleBooking = (showId) => {
    navigate(`/book/${showId}`);
  };

  return (
    <div
      className="u1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 className="home-title">Upcoming Shows</h2>

      <div style={{ position: "relative", overflow: "hidden" }}>
        <button onClick={scrollLeft} className="c1">◀</button>

        <div
          ref={sliderRef}
          style={{
            display: "flex",
            overflowX: "auto",
            scrollBehavior: "smooth",
            gap: "16px",
            padding: "3px 0",
          }}
        >
          {upcomingShows.map((show, index) => (
            <div key={index} className="u4" style={{ minWidth: "260px" }}>
              <img
                src={show.image}
                alt={show.title}
                style={{ width: "100%", height: "320px", objectFit: "cover" }}
              />
              <div style={{ padding: "10px", textAlign: "center" }}>
                <h3
                  style={{
                    marginBottom: "5px",
                    fontSize: "18px",
                    fontFamily: "poppins",
                    fontWeight: 700,
                  }}
                >
                  {show.title}
                </h3>
                <p style={{ fontSize: "15px", color: "#661F19" }}>
                  {show.date} {show.time}
                </p>
                <p style={{ fontSize: "14px", color: "#661F19" }}>
                  {show.venue}
                </p>
              </div>
              <div style={{ padding: "10px", textAlign: "center" }}>
                <button className="u5" onClick={() => handleBooking(show.id)}>
                  Book Your Seat Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={scrollRight} className="c4">▶</button>
      </div>
    </div>
  );
};

export default UpcomingShowsSlider;
