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
                    <p className="text-sm text-gray-400 mt-2 mb-4">
                        The ultimate platform for booking stage drama tickets in Sri Lanka.
                    </p>
                    <div className="social-icons flex gap-4">
                        {/* Ensure you have these images or replace with icons like FontAwesome */}
                        {/* <a href="https://instagram.com"><img src="/images/instagram.avif" alt="Instagram" /></a> */}
                        {/* <a href="https://youtube.com"><img src="/images/youtube.svg" alt="YouTube" /></a> */}
                        {/* <a href="https://linkedin.com"><img src="/images/linkedin.svg" alt="LinkedIn" /></a> */}
                    </div>
                </div>

                {/* Section 1: Discover / Navigation */}
                <div className="footer-section">
                    <h3 className="footer-title">Discover</h3>
                    <ul>
                        <li><a href="/dramas">Latest Dramas</a></li>
                        <li><a href="/schedule">Upcoming Shows</a></li>
                        <li><a href="/actors">Artists & Actors</a></li>
                        <li><a href="/venues">Theater Venues</a></li>
                    </ul>
                </div>

                {/* Section 2: Support / Customer Care */}
                <div className="footer-section">
                    <h3 className="footer-title">Support</h3>
                    <ul>
                        <li><a href="/contact">Contact Us</a></li>
                        <li><a href="/faq">Help & FAQ</a></li>
                        <li><a href="/how-to-book">How to Book</a></li>
                        <li><a href="/refund-policy">Refund Policy</a></li>
                    </ul>
                </div>

                {/* Section 3: Company / Legal */}
                <div className="footer-section">
                    <h3 className="footer-title">Nataka.lk</h3>
                    <ul>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/terms">Privacy Policy</a></li>
                        <li><a href="/terms">Terms & Conditions</a></li>
                        <li><a href="/login">Login / Register</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                © {new Date().getFullYear()} Nataka.lk - All Rights Reserved.
            </div>
        </footer>
    );
};

export default Footer;