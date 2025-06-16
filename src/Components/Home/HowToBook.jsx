import React from 'react';

const HowToBook = () => {
  return (
    <div className="c5">
      {/* Left: Steps */}
      <div style={{ flex: '1 1 400px', minWidth: '300px' }}>
        <h2 style={{ fontSize: '40px', fontWeight: 'bolder', marginBottom: '20px' }}>How to Book A Ticket</h2>
        <ol style={{ lineHeight: '1.8', fontSize: '20px', color: 'black' }}>
          <li><strong>Browse Dramas</strong> – Search by category, city, or date</li>
          <li><strong>Select Your Show</strong> – View details and choose your seat</li>
          <li><strong>Make Payment</strong> – Pay securely online</li>
          <li><strong>Get Your Ticket</strong> – Receive QR e-ticket via email/SMS</li>
          <li><strong>Enjoy the Show</strong> – Scan your ticket at the entrance</li>
        </ol>
      </div>

      {/* Right: Video */}
      <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
        <video src="/videos/how-to-book.mp4" controls style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          Your browser does not support the video tag. </video>
      </div>
    </div>
  );
};

export default HowToBook;