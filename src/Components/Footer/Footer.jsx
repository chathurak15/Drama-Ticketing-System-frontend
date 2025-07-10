import React from 'react';
import '../../assets/css/Footer.css'; // Import the CSS file
import logo from "../../assets/logo nataka white.png"

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container container mx-auto px-4 ">
                {/* Logo and Social */}
                <div className="footer-section logo-social">
                    <div className="logo-title">
                        <img src={logo} alt="Nataka.LK" className="logo" />
                    </div>
                    {/* <div className="social-icons">
                        <a href="#"><img src="/images/instagram.avif" alt="Instagram" /></a>
                        <a href="#"><img src="/images/youtube.svg" alt="YouTube" /></a>
                        <a href="#"><img src="/images/linkedin.svg" alt="LinkedIn" /></a>
                    </div> */}
                    
                </div>

                {/* Use Cases */}
                <div className="footer-section">
                    <h3 className="footer-title">Use cases</h3>
                    <ul>
                        <li>UI design</li>
                        <li>UX design</li>
                        <li>Wireframing</li>
                        <li>Diagramming</li>
                        <li>Brainstorming</li>
                        <li>Online whiteboard</li>
                        <li>Team collaboration</li>
                    </ul>
                </div>

                {/* Explore */}
                <div className="footer-section">
                    <h3 className="footer-title">Explore</h3>
                    <ul>
                        <li>Design</li>
                        <li>Prototyping</li>
                        <li>Development features</li>
                        <li>Design systems</li>
                        <li>Collaboration features</li>
                        <li>Design process</li>
                        <li>FigJam</li>
                    </ul>
                </div>

                {/* Resources */}
                <div className="footer-section">
                    <h3 className="footer-title">Resources</h3>
                    <ul>
                        <li><a href="/dramas">Dramas</a></li>
                        <li><a href="/shows">Shows</a></li>
                        <li><a href="/actors">Actors</a></li>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/contact">Contact</a></li>
                        <li><a href="/login">Login/Register</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                ©2025 - All Right Reserved. Designed and Developed by Nataka.lk
            </div>
        </footer>
    );
};

export default Footer;