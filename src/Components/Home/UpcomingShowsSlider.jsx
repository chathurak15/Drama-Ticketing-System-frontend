import React, { useEffect, useRef, useState } from 'react';
import '../Home/Home.css'

const upcomingShows = [
  {
    image: '/images/drama1.jpg',
    title: 'මම නෙමෙයි වෙන කෙනෙක්',
    date: 'October 26, 2025',
    time: '7:00 PM',
    venue: 'Lionel Wendt Theatre',
  },
  {
    image: '/images/drama3.jpg',
    title: 'ගුරු තරු',
    date: 'November 3, 2025',
    time: '6:30 PM',
    venue: 'Nelum Pokuna Theatre',
  },
  {
    image: '/images/drama4.jpg',
    title: 'පිරිමියෙක්ගෙන් පැමිණිල්ලක්',
    date: 'November 10, 2025',
    time: '6:00 PM',
    venue: 'Town Hall Theatre',
  },
  {
    image: '/images/drama5.jpg',
    title: 'ලෝරන්ස්ගේ මනමාලි',
    date: 'November 18, 2025',
    time: '7:30 PM',
    venue: 'Elphinstone Theatre',
  },
  {
    image: '/images/drama1.jpg',
    title: 'Drama',
    date: 'November 24, 2025',
    time: '7:00 PM',
    venue: 'Welikada Drama Center',
  },
  {
    image: '/images/drama1.jpg',
    title: 'Drama',
    date: 'December 1, 2025',
    time: '6:00 PM',
    venue: 'National Theatre',
  },
  {
    image: '/images/drama1.jpg',
    title: 'Drama',
    date: 'December 1, 2025',
    time: '6:00 PM',
    venue: 'National Theatre',
  },
  {
    image: '/images/drama1.jpg',
    title: 'Drama',
    date: 'December 1, 2025',
    time: '6:00 PM',
    venue: 'National Theatre',
  },
  {
    image: '/images/drama1.jpg',
    title: 'Drama',
    date: 'December 1, 2025',
    time: '6:00 PM',
    venue: 'National Theatre',
  },
  {
    image: '/images/drama1.jpg',
    title: 'Drama',
    date: 'December 1, 2025',
    time: '6:00 PM',
    venue: 'National Theatre',
  },
];

const UpcomingShowsSlider = () => {
  const sliderRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current && !isHovered) {
        sliderRef.current.scrollBy({
          left: 280,
          behavior: 'smooth',
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -280,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: 280,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="u1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '40px', fontWeight: 'bolder' }}>Upcoming Shows</h2>

      {/* Arrow Buttons */}
      <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
        <button onClick={scrollLeft} className="u2"> ◀ </button>

        <div ref={sliderRef} className="u3" >
          {upcomingShows.map((show, index) => (

            <div key={index} className="u4" >

              <img src={show.image} alt={show.title} style={{ width: '100%', height: '320px', objectFit: 'cover', }} />

              <div style={{ padding: '10px', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '5px', fontSize: '16px' }}>{show.title}</h3>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>{show.date} {show.time}</p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#888' }}>{show.venue}</p>
              </div>
              <div style={{ padding: '10px', textAlign: 'center' }}>
                <button className="u5" > Book Your Seat Now </button>
              </div>
            </div>

          ))}
        </div>

        <button onClick={scrollRight} className="u6"> ▶ </button>
      </div>
    </div>
  );
};

export default UpcomingShowsSlider;