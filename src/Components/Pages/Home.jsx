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

function Home() {
  const navigate = useNavigate();
  const [upcomingShows, setUpcomingShows] = useState([]);

  useEffect(() => {
    const fetchUpcomingShows = async () => {
      try {
        const response = await getShows({page: 0, size: 16 });
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
