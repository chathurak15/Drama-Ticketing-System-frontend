import './App.css'
import React from 'react';
import Header from './Components/Header/Header'
import Home from './Components/Pages/Home'
import Dramas from './Components/Pages/Dramas'
import Shows from './Components/Pages/Shows'
import Actors from './Components/Pages/Actors'
import AboutUs from './Components/Pages/AboutUs'
import Contact from './Components/Pages/Contact'
import Login from './Components/Pages/Login'
import { Router, Routes } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import BookingPage from './Components/Pages/BookingPage';

function App() {

  return (
    <>
      <Router>
        <Header/>
        <Routes>
          <Route path = "/" element = {<Home />} />
          <Route path = "/dramas" element = {<Dramas />} />
          <Route path = "/dramas/:id" element = {<div>Drama deails will go here later.</div>}/>
          <Route path = "/shows" element = {<Shows />} />
          <Route path = "/booking/:id" element = {<BookingPage/>}/>
          <Route path = "/actors" element = {<Actors />} />
          <Route path = "/about" element = {<AboutUs />} />
          <Route path = "/contact" element = {<Contact />} />
          <Route path = "/login" element = {<Login />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
