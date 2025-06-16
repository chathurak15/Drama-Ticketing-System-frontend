import React, { useRef } from 'react';

const dramas = [
  {
    title: "මම නෙමෙයි වෙන කෙනෙක්",
    image: "/images/drama1.jpg",
  },
  {
    title: "ගුරු තරු",
    image: "/images/drama3.jpg",
  },
  {
    title: "පිරිමියෙක්ගෙන් පැමිණිල්ලක්",
    image: "/images/drama4.jpg",
  },
  {
    title: "ලෝරන්ස්ගේ මනමාලි",
    image: "/images/drama5.jpg",
  },
  {
    title: "Drama",
    image: "/images/drama1.jpg",
  },
  {
    title: "Drama",
    image: "/images/drama1.jpg",
  },
  {
    title: "Drama",
    image: "/images/drama1.jpg",
  },
  {
    title: "Drama",
    image: "/images/drama1.jpg",
  },
  {
    title: "Drama",
    image: "/images/drama1.jpg",
  },
  {
    title: "Drama",
    image: "/images/drama1.jpg",
  },
  {
    title: "Drama",
    image: "/images/drama1.jpg",
  },
  {
    title: "Drama",
    image: "/images/drama1.jpg",
  },
];

const NewDramas = () => {
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
    <div style={{ position: 'relative', width: '100%', padding: '40px 0'}}>

<<<<<<< Updated upstream
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '40px', fontWeight: 'bolder'}}>--New Dramas--</h2>
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
                        <h3 style={{ margin: '10px 0 5px', fontSize: '16px', color: 'white'}}>{drama.title}</h3>
                    </div>
                </div>
            ))}
        </div>
        <button onClick={() => scroll('right')} className="c4"> ▶ </button>
=======
      <h2 className='home-title'>New Dramas</h2>
      <button onClick={() => scroll('left')} className="c1"> ◀ </button>

      <div ref={scrollRef} className="c2">
        {dramas.map((drama, index) => (
          <div key={index} className="c3">
            <a href={`/drama/${drama.id}`} style={{ textDecoration: 'none' }}>
            <img
              src={drama.image}
              alt={drama.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ padding: '10px' }}>
              <h3 style={{ margin: '10px 0 5px', fontSize: '16px', color: 'white' }}>{drama.title}</h3>
            </div>
            </a>
          </div>
        ))}
      </div>
      <button onClick={() => scroll('right')} className="c4"> ▶ </button>
>>>>>>> Stashed changes
    </div>
  );
};

export default NewDramas;