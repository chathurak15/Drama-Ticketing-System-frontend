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
  const { translatedTexts, loading } = useTranslation();

  useEffect(() => {
    const fetchUpcomingShows = async () => {
      try {
        const response = await getShows({ page: 0, size: 16 });
        setUpcomingShows(response.data.content);
      } catch (error) {
        console.error("Error fetching upcoming shows:", error);
      }
    };

    fetchUpcomingShows();
  }, []);

  const handleBookClick = () => {
    navigate("/shows");
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div id="wrapper">
        <Header />
        <Body>
          <div
            className="bg-cover bg-center relative"
            style={{ backgroundImage: `url(${headerImage})` }}
          >
            {/* Overlay content */}
            <div className="overlay-content container mx-auto px-4 py-8">
              <h1>{translatedTexts?.home?.headerTitle || "Book Your Seats Now"}</h1>
              <p>{translatedTexts?.home?.headerSubtitle || "Easy stage drama ticket booking."}</p>
              <button onClick={handleBookClick}>
                {translatedTexts?.home?.bookButton || "Book Tickets"}
              </button>
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
            <div>
              <UpcomingShowsSlider upcomingShows={upcomingShows} />
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
