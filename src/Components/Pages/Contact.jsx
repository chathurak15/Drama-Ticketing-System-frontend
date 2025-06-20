import React from 'react';
import '../../assets/css/Contact.css';
import contactImg from '../../assets/image/drama.png';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import AboutUs from './AboutUs';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';

const Contact = () => {
  return (
    <>
    <Header/>
    <AboutUs/>
    <section className="contact-section">
      <div className="contact-container with-image">

        {/* Image Section */}
        <div className="contact-img">
          <img src={contactImg} alt="Contact Illustration" />
        </div>

        {/* Form & Details Section */}
        <div className="contact-form-wrapper">
          <div className="contact-header">
            <h2>Get In Touch</h2>
            <p>We'd love to hear from you. Fill out the form below to reach us!</p>
          </div>

          <form className="contact-form">
            <input type="text" placeholder="Your Name" required />
            <input type="text" placeholder="Contact Number" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" required></textarea>
            <button type="submit">Send Message</button>
          </form>

          {/* Additional contact info */}
          <div className="contacts-details">
            <p><FaMapMarkerAlt /> <strong>Main Branch:</strong> 52/1, Galle Road, Colombo 03</p>
            <p><FaMapMarkerAlt /> <strong>Wattala Branch:</strong> 389, Negombo Road, Wattala</p>
            <p><FaMapMarkerAlt /> <strong>Kiribathgoda Branch:</strong> 210, Kandy Road, Kiribathgoda</p>
            <p><FaMapMarkerAlt /> <strong>Matara Branch:</strong> 87A, Main Street, Matara</p>
            <p><FaPhoneAlt /> <strong>Phone:</strong> +94 117 788 788  , +94 773 256 978</p>
            <p><FaEnvelope /> <strong>Email:</strong> info@nataka.com</p>
            <p>
              <strong>Follow Us:</strong>
              <span className="social-icons">
                <FaFacebook /> <FaInstagram /> <FaTwitter /> <FaWhatsapp />
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
    <Footer/>
    </>
  );
};

export default Contact;
