import { useParams } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "../../assets/css/DramaDetails.css";
import "../Shows/ShowsData";
// import showsData from "../Shows/ShowsData";
import { getDramaById, getRatings } from "../../services/dramaService";
import { useNavigate } from "react-router-dom";
import UpcomingShowsSlider from "../Home/UpcomingShowsSlider";
const DramaDetails = () => {
  const navigate = useNavigate();

  const { id } = useParams();
  const [drama, setDrama] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [startIndex, setStartIndex] = useState(0);

  // Fetch drama details and reviews on component mount
  useEffect(() => {
    const fetchDramaData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch drama details
        const dramaResponse = await getDramaById(id);
        setDrama(dramaResponse.data);

        document.title = `${dramaResponse.data.title}`;

        // Fetch reviews/ratings
        try {
          const reviewsResponse = await getRatings(0, 12, id);
          console.log("Reviews response:", reviewsResponse);
          setReviews(reviewsResponse.data.content || []);
        } catch (reviewError) {
          console.warn("Failed to fetch reviews:", reviewError);
          // Continue without reviews if drama details loaded successfully
          setReviews([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching drama data:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url,
        });
      }
    };

    if (id) {
      fetchDramaData();
    }
  }, [id]);

  // const visibleShows = showsData.slice(startIndex, startIndex + 4);

  // const handleNext = () => {
  //   if (startIndex + 4 < showsData.length) {
  //     setStartIndex(startIndex + 1);
  //   }
  // };

  // const handlePrev = () => {
  //   if (startIndex > 0) {
  //     setStartIndex(startIndex - 1);
  //   }
  // };

  const scrollRef = useRef();

  const scroll = (direction) => {
    if (direction === "left") {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    } else {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Helper function to render stars based on rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    return "★".repeat(fullStars) + (halfStar ? "☆" : "");
  };

  const convertToEmbedUrl = (url) => {
    try {
      const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
      const match = url.match(youtubeRegex);

      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    } catch (err) {
      console.error("Invalid YouTube URL:", url,err);
    }

    return null;
  };

  // Helper function to format duration
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!drama) return <div>Drama not found</div>;

  return (
    <>
      <Header />
      <div className="drama-page container mx-auto px-4 py-8 ">
        <div className="top-section">
          <img
            src={`/public/images/upload/drama/${drama.image}`}
            className="drama-poster"
            alt={drama.title}
          />
          <div className="drama-details">
            <h1 className="drama-title">{drama.title} - Stage Drama</h1>
            <div className="drama-info">
              <span className="rating">
                Rating: {drama.rating}{" "}
                <i
                  className="fa-solid fa-star"
                  style={{ color: "#ffae00" }}
                ></i>
              </span>
              <span className="duration">
                ⏱ {formatDuration(drama.duration)}
              </span>
            </div>
            <div className="flex justify-center mt-3">
              <button
                onClick={() => navigate(`/show-by-drama/${id}`)}
                className="mt-3 booking-btn hover:bg-amber-700 text-white px-13 py-3 rounded-full font-semibold shadow-md transition duration-300"
              >
                Book a Show
              </button>
            </div>
          </div>
        </div>
       
        <div className="description-section mt-30 mb-20">
          <div className="description-text">
            <h2>Description</h2>
            <p>{drama.description}</p>
          </div>

          <div className="video-section">
            <iframe
              width="100%"
              height="250"
              src={
                convertToEmbedUrl(drama.videoUrl) ||
                "https://www.youtube.com/embed/defaultVideoId"
              }
              title={`${drama.title} - Best Clips`}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
       
        <div className="cast-section mb-20">
          <h2>Cast</h2>
          <div className="cast-grid">
            {drama.actors &&
              drama.actors.map((actor, index) => (
                <div className="cast-card" key={actor.id || index}>
                  <img
                    src={`/public/images/upload/actor/${actor.photo}`}
                    className="cast-photo"
                    alt={actor.name}
                  />
                  <p className="cast-name">{actor.name}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="audience-reviews-section mb-20">
          <h2>Audience Reviews</h2>
          <div className="review-controls">
            <button className="arrow-btn" onClick={() => scroll("left")}>
              &lt;
            </button>
            <div className="reviews-container" ref={scrollRef}>
              {reviews.map((review, index) => (
                <div className="review-card" key={review.id || index}>
                  <div className="stars">{renderStars(review.rating)}</div>
                  <div className="review-meta">
                    <strong>
                      {review.user
                        ? `${review.user.fname} ${review.user.lname}`
                        : "Anonymous"}
                    </strong>
                    <span>{new Date(review.created).toLocaleDateString()}</span>
                  </div>
                  <p className="review-text">{review.comment}</p>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="no-reviews">
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
            <button className="arrow-btn" onClick={() => scroll("right")}>
              &gt;
            </button>
          </div>
        </div>
       <div>
        <UpcomingShowsSlider/>
       </div>
        
        <div className="upcoming-section mb-15" >
          {/* <div className="slide-container">
            <button onClick={handlePrev} className="arrow-btn">
              ←
            </button>
            <div className="card-slider">
              {visibleShows.map((show) => (
                <div className="show-card" key={show.id}>
                  <div className="image-container">
                    <img src={show.image} alt={show.name} />
                    <div className="city-overlay">{show.city}</div>
                  </div>
                  <h3>{show.title}</h3>
                  <p>
                    {show.date} | {show.time}
                  </p>
                  <p className="location">{show.location}</p>
                  <button className="book-btn">Booking</button>
                </div>
              ))}
            </div>
            <button onClick={handleNext} className="arrow-btn">
              →
            </button>
          </div> */}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DramaDetails;
