import React from 'react'
import Header from '../Header/Header'
import Body from '../Body/Body'
import headerImage from "../../assets/Stage.png"
import UpcomingShowsSlider from '../Home/UpcomingShowsSlider'
import NewDramas from '../Home/NewDramas'
import HowToBook from '../Home/HowToBook'
import Footer from '../Footer/Footer'
import CardSlider from '../Home/CardSlider'
import SearchShows from '../Home/SearchShows'
import './Home.css'

function Home() {
  return (
    <>
    <div id="wrapper">
        <Header />
        <Body>
          <div className="bg-cover bg-center h-[500px] relative" style={{ backgroundImage: `url(${headerImage})` }}>
            {/* Overlay content */}
            <div className="overlay-content">
              <h1>Book Your <br /> seats Now!</h1>
              <p>Easy stage drama ticket booking.</p>
              <button>
                Book Tickets
              </button>
            </div>
          </div>
          <div>
            <SearchShows />
          </div>
          <br />
          <div className="home-container">
            <div>
              <CardSlider />
            </div>
            <br />
            <div>
              <UpcomingShowsSlider />
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
  )
}

export default Home
