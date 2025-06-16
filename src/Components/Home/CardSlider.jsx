import React, { useRef } from 'react';
import '../Home/Home.css'

const dramas = [
  {
    title: "මම නෙමෙයි වෙන කෙනෙක්",
    rating: 4.8,
    image: "/images/drama1.jpg",
  },
  {
    title: "ගුරු තරු",
    rating: 4.8,
    image: "/images/drama3.jpg",
  },
  {
    title: "පිරිමියෙක්ගෙන් පැමිණිල්ලක්",
    rating: 4.8,
    image: "/images/drama4.jpg",
  },
  {
    title: "ලෝරන්ස්ගේ මනමාලි",
    rating: 4.7,
    image: "/images/drama5.jpg",
  },
  {
    title: "Drama",
    rating: 4.9,
    image: "/images/drama1.jpg",
  },
  {
    title: "Drama",
    rating: 5.0,
    image: "/images/drama1.jpg",
  },
  {
    title: "Drama",
    rating: 4.9,
    image: "/images/drama1.jpg",
  },
  {
    title: "Drama",
    rating: 4.7,
    image: "/images/drama1.jpg",
  },
  {
    title: "Drama",
    rating: 4.6,
    image: "/images/drama1.jpg",
  },
  {
    title: "Drama",
    rating: 4.8,
    image: "/images/drama1.jpg",
  },
  {
    title: "Drama",
    rating: 4.7,
    image: "/images/drama1.jpg",
  },
  {
    title: "Drama",
    rating: 4.9,
    image: "/images/drama1.jpg",
  },
];

const CardSlider = () => {
  const scrollRef = useRef(null);
  const cardWidth = 280;
  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth * 4 : cardWidth * 4,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', padding: '40px 0' }}>

      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '40px', fontWeight: 'bolder' }}>Top Rated Dramas</h2>
      <button onClick={() => scroll('left')} className="c1"> ◀ </button>

      <div ref={scrollRef} className="c2">
        {dramas.map((drama, index) => (
          <div key={index} className="c3">
            <img
              src={drama.image}
              alt={drama.title}
              style={{ width: '100%', height: '180px', objectFit: 'cover' }}
            />
            <div style={{ padding: '10px' }}>
              <h3 style={{ margin: '10px 0 5px', fontSize: '16px', color: 'white' }}>{drama.title}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'white' }}>{drama.rating} ⭐</p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => scroll('right')} className="c4"> ▶ </button>
    </div>
  );
};

export default CardSlider;