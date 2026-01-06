import { useParams } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "../../assets/css/DramaDetails.css";
import { getDramaById, getRatings } from "../../services/dramaService";
import { useNavigate } from "react-router-dom";
import UpcomingShowsSlider from "../Home/UpcomingShowsSlider";
import { getShowsByDramaId } from "../../services/ShowService";

const DramaDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [drama, setDrama] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingShows, setUpcomingShows] = useState([]);

  const BACKEND_IMAGE_URL = "https://d3ay14vkclriu.cloudfront.net/uploads/dramas/";
  const BACKEND_Actor_IMAGE_URL = "https://d3ay14vkclriu.cloudfront.net/uploads/actors/";

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Run fetches in parallel for speed
        const [dramaRes, showsRes] = await Promise.all([
          getDramaById(id),
          getShowsByDramaId({ page: 0, size: 16, dramaId: id }),
          // Optional: Add minimum load time to prevent flicker
          new Promise(resolve => setTimeout(resolve, 600))
        ]);

        setDrama(dramaRes.data);
        setUpcomingShows(showsRes.data.content || []);

        // Fetch reviews separately (non-blocking if it fails)
        try {
          const reviewsRes = await getRatings(0, 12, id);
          setReviews(reviewsRes.data.content || []);
        } catch (err) {
          console.warn("No reviews found or error fetching reviews");
        }

      } catch (err) {
        console.error("Error fetching drama details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const scrollRef = useRef();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const halfStar = (rating || 0) % 1 !== 0;
    return "★".repeat(fullStars) + (halfStar ? "☆" : "");
  };

  const convertToEmbedUrl = (url) => {
    if (!url) return null;
    try {
      const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
      const match = url.match(youtubeRegex);
      return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
    } catch (err) {
      return null;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <>
      {/* --- LOADING OVERLAY --- */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800">Nataka.lk</h2>
            <p className="text-gray-600 text-sm font-medium animate-pulse">
              Setting the stage...
            </p>
          </div>
        </div>
      )}

      <Header />
      
      {/* Only render content if drama exists or we are loading (to keep structure) */}
      <div className="drama-page container mx-auto px-4 py-8">
        {drama && (
          <>
            <div className="top-section">
              <img
                src={drama.image ? `${BACKEND_IMAGE_URL}${drama.image}` : "/images/default.png"}
                className="drama-poster"
                alt={drama.title}
              />
              <div className="drama-details">
                <h1 className="drama-title">{drama.title}</h1>
                <div className="drama-info">
                  <span className="rating">
                    {drama.rating?.toFixed(1)} <i className="fa-solid fa-star" style={{ color: "#ffae00" }}></i>
                  </span>
                  <span className="duration">
                    ⏱ {formatDuration(drama.duration)}
                  </span>
                </div>
                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => navigate(`/shows/${id}`)}
                    className="booking-btn bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full font-semibold shadow-md transition duration-300 mt-4"
                  >
                    Book a Show
                  </button>
                </div>
              </div>
            </div>

            <div className="description-section">
              <div className="description-text">
                <h2>Description</h2>
                <p>{drama.description}</p>
              </div>

              <div className="video-section">
                <iframe
                  src={convertToEmbedUrl(drama.videoUrl)}
                  title={drama.title}
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            <div className="cast-section">
              <h2>Cast</h2>
              <div className="cast-grid">
                {drama.actors && drama.actors.map((actor, index) => (
                  <div className="cast-card" key={actor.id || index}>
                    <img
                      src={actor.photo ? `${BACKEND_Actor_IMAGE_URL}${actor.photo}` : "/images/default.png"}
                      className="cast-photo"
                      alt={actor.name}
                    />
                    <p className="cast-name">{actor.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="audience-reviews-section">
              <h2>Audience Reviews</h2>
              <div className="review-controls">
                <button className="arrow-btn" onClick={() => scroll("left")}>&lt;</button>
                <div className="reviews-container" ref={scrollRef}>
                  {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                      <div className="review-card" key={review.id || index}>
                        <div className="stars">{renderStars(review.rating)}</div>
                        <div className="review-meta">
                          <strong>{review.user ? `${review.user.fname} ${review.user.lname}` : "User"}</strong>
                          <span>{new Date(review.created).toLocaleDateString()}</span>
                        </div>
                        <p className="review-text">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="no-reviews w-full text-center p-4">
                      <p className="text-gray-500">No reviews yet.</p>
                    </div>
                  )}
                </div>
                <button className="arrow-btn" onClick={() => scroll("right")}>&gt;</button>
              </div>
            </div>

            <div className="mt-12">
              <UpcomingShowsSlider upcomingShows={upcomingShows} />
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default DramaDetails;