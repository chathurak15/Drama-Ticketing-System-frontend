import React, { useRef, useState, useEffect } from 'react';
import { getDramas } from '../../services/dramaService';
import useTranslation from '../../hooks/useTranslation'; 

const NewDramas = () => {
  const [dramas, setDramas] = useState([]);
  const { translatedTexts } = useTranslation();
  const BACKEND_IMAGE_URL = "http://localhost:8080/uploads/dramas/"; 

  useEffect(() => {
    const fetchDramas = async () => {
      try {
        const response = await getDramas({ page: 0, size: 16, sortByRating: 'ASC' });
        setDramas(response.data.content || response.data);
      } catch (error) {
        console.error('Error fetching dramas:', error);
      }
    };

    fetchDramas();
  }, []);

  const scrollRef = useRef(null);
  // Responsive card width: 90vw on mobile, 280px on desktop
  const getCardWidth = () => {
    if (window.innerWidth < 640) return window.innerWidth * 0.9;
    return 280;
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const cardWidth = getCardWidth();
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2,
        behavior: 'smooth',
      });
    }
  };

  // Touch/swipe support for mobile
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let startX = 0;
    let scrollLeft = 0;
    const onTouchStart = (e) => {
      startX = e.touches[0].pageX;
      scrollLeft = container.scrollLeft;
    };
    const onTouchMove = (e) => {
      if (startX) {
        const dx = startX - e.touches[0].pageX;
        container.scrollLeft = scrollLeft + dx;
      }
    };
    container.addEventListener('touchstart', onTouchStart);
    container.addEventListener('touchmove', onTouchMove);
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
    };
  }, [dramas]);

  return (
    <div className="new-dramas-slider-container" style={{ position: 'relative', width: '100%', padding: '40px 0' }}>
      <h2 className="home-title">
        {translatedTexts?.home?.newDramasTitle || "New Dramas"}
      </h2>

      {/* Hide scroll buttons on mobile */}
      <button
        onClick={() => scroll('left')}
        className="c1 new-dramas-slider-btn"
        style={{ display: window.innerWidth < 640 ? 'none' : 'inline-block' }}
      >
        ◀
      </button>

      <div
        ref={scrollRef}
        className="c2 new-dramas-slider-scroll"
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '16px',
          scrollBehavior: 'smooth',
          padding: '10px 0',
        }}
      >
        {dramas.map((drama, index) => (
          <div
            key={index}
            className="c3 new-dramas-slider-card"
            style={{
              minWidth: window.innerWidth < 640 ? '90vw' : '280px',
              maxWidth: window.innerWidth < 640 ? '90vw' : '280px',
              background: '#661F19',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              flex: '0 0 auto',
            }}
          >
            <a href={`/drama/${drama.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <img
                src={
                  drama.image
                    ? `${BACKEND_IMAGE_URL}${drama.image}`
                    : "/images/default.png"
                }
                alt={drama.title}
                style={{ width: '100%', height: window.innerWidth < 640 ? '140px' : '200px', objectFit: 'cover' }}
              />
              <div style={{ padding: '10px' }}>
                <h3 style={{ margin: '10px 0 5px', fontSize: window.innerWidth < 640 ? '15px' : '16px', color: 'white' }}>
                  {drama.title}
                </h3>
              </div>
            </a>
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="c4 new-dramas-slider-btn"
        style={{ display: window.innerWidth < 640 ? 'none' : 'inline-block' }}
      >
        ▶
      </button>
    </div>
  );
};

export default NewDramas;
