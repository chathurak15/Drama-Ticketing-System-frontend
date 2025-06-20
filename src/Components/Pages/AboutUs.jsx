import React from 'react';
import '../../assets/css/About.css';
import logo from '../../assets/image/logo nataka.png';
import Platform from '../../assets/image/platform.jpg'

const AboutUs = () => {
  return (
    <>
      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="intro-with-image">
            <div className="about-text">
              <h1 className="about-heading">About Us</h1>
              <p>
                Nataka.LK is a platform dedicated to promoting stage drama,
                cultural shows, and local talent. We provide a space for organizers,
                performers, and fans to connect and celebrate theatrical arts.
              </p>
              <p>
                Our mission is to preserve Sri Lanka’s rich tradition of stage drama
                while making it more accessible to the digital generation.
                We believe storytelling builds stronger communities and creates unforgettable experiences.
              </p>
              <p>
                Through Nataka.LK, you can discover upcoming performances, book tickets online,
                explore drama archives, and even showcase your own talent.
                We offer a digital bridge between traditional performance art and modern audiences.
              </p>
            </div>

            <div className="about-logo">
              <img src={logo} alt="Nataka.LK Logo" />
            </div>
          </div>

          <div className="platform-support">
            <div className="support-wrapper">
              <div className="support-image">
                <img src={Platform} alt="Platform Support" />
              </div>

              <div className="support-text">
                <p className="platform-title">-- Our platform supports: --</p>
                <div className="centered-list">
                  <ul>
                    <li>Drama and event listings with performer details</li>
                    <li>Online ticket reservations and seat selection</li>
                    <li>Promotions for new and local talent</li>
                    <li>Collaboration with schools, universities, and cultural organizations</li>
                    <li>Community engagement through reviews, ratings, and sharing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <p className="future-vision">
            Looking forward, we aim to introduce virtual theater experiences, live-streamed plays,<br />
            and educational content for students and enthusiasts of performing arts.
          </p>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
