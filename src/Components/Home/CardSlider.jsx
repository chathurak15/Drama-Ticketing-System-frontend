import React, { useRef,useEffect,useState } from 'react';
import { getDramas } from '../../services/dramaService';

const CardSlider = () => {

  const [dramas, setDramas] = useState([]);

  useEffect(() => {
      const fetchDramas = async () => {
        try {
          const response = await getDramas({ page: 0, size: 16, sortByRating: 'desc' });
          setDramas(response.data.content || response.data);
        } catch (error) {
          console.error('Error fetching dramas:', error);
        }
      };
  
      fetchDramas();
    }, []);

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
    <div style={{ position: 'relative', padding: '25px 0' }}>

      <h2 className='home-title'>Top Rated Dramas</h2>
      <button onClick={() => scroll('left')} className="c1"> ◀ </button>

      <div ref={scrollRef} className="c2">
        {dramas.map((drama, index) => (
          <div key={index} className="c3">
            <a href={`/drama/${drama.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <img
              src={drama.image}
              alt={drama.title}
              style={{ width: '100%', height: '220px', objectFit: 'cover' }}
            />
            <div style={{ padding: '10px' }}>
              <h3 style={{ margin: '10px 0 5px', fontSize: '18px', color: 'white' }}>{drama.title}</h3>
              <p style={{ margin: 0, fontSize: '17px', color: 'white' }}>{drama.rating} ⭐</p>
            </div>
            </a>
          </div>
        ))}
      </div>
      <button onClick={() => scroll('right')} className="c4"> ▶ </button>
    </div>
  );
};

export default CardSlider;