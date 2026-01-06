import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import Body from "../Body/Body";
import headerImage from "../../assets/hero.png";
import UpcomingShowsSlider from "../Home/UpcomingShowsSlider";
import NewDramas from "../Home/NewDramas";
import HowToBook from "../Home/HowToBook";
import Footer from "../Footer/Footer";
import CardSlider from "../Home/CardSlider";
import SearchShows from "../Home/SearchShows";
import { useNavigate } from "react-router-dom";
import "../../assets/css/Home.css";
import { getShows } from "../../services/ShowService";
import useTranslation from "../../hooks/useTranslation";

function Home() {
  const navigate = useNavigate();
  const [upcomingShows, setUpcomingShows] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Get translation loading status
  const { translatedTexts, loading: translationLoading } = useTranslation();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setDataLoading(true);
        const [showsResponse] = await Promise.all([
          getShows({ page: 0, size: 16 }),
          // Optional: Add a small delay so the spinner doesn't flash too quickly
          new Promise(resolve => setTimeout(resolve, 800)) 
        ]);
        setUpcomingShows(showsResponse.data.content);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleBookClick = () => {
    navigate("/shows");
  };

  // Determine if we should show the overlay
  const isPageLoading = translationLoading || dataLoading;

  return (
    <>
      {/* --- LOADING OVERLAY --- */}
      {isPageLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          {/* bg-white/80 : White background with 80% opacity (transparency)
             backdrop-blur-sm : Blurs the content behind the overlay slightly
             z-50 : Ensures it sits on top of everything
          */}
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800">Nataka.lk</h2>
            <p className="text-gray-600 text-sm font-medium animate-pulse">
              Setting up the stage...
            </p>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT (Always rendered, but covered by overlay when loading) --- */}
      <div id="wrapper">
        <Header />
        <Body>
          <div
            className="bg-cover bg-center relative"
            style={{ backgroundImage: `url(${headerImage})` }}
          >
            <div className="overlay-content container mx-auto px-4 py-8">
              <h1>
                Book Your <br /> Seats Now
              </h1>
              <p>Easy stage drama ticket booking.</p>
              <button onClick={handleBookClick}>Book Tickets</button>
            </div>
          </div>
          
          <div>
            <SearchShows />
          </div>
          <br />
          
          <div className="container mx-auto px-4">
            <div>
              <CardSlider />
            </div>
            <br />
            {/* Pass empty array safely while loading */}
            <div>
              <UpcomingShowsSlider upcomingShows={upcomingShows || []} />
            </div>
            <br />
            <div>
              <NewDramas />
            </div>
            <br />
            <div>
              <HowToBook />
            </div>
            <br />
          </div>
          
          <div>
            <Footer />
          </div>
        </Body>
      </div>
    </>
  );
}

export default Home;