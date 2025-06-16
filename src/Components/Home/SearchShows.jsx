// SearchBar.jsx
import React from "react";

const SearchShows = () => {
  return (
<<<<<<< Updated upstream
    <div className="search-section">
      <h2 className="search-title">Search Shows</h2>
      <div className="search-row">
        <select className="search-input">
          <option>Select Location</option>
          <option>Colombo</option>
          <option>Kandy</option>
        </select>

        <input type="date" className="search-input" />

        <div className="search-box-group">
          <input
            type="text"
            placeholder="Search by title, category, or date"
            className="search-text"
          />
          <button className="search-button">Search</button>
=======
    <div className="search-bar-wrapper">
      <div className="container mx-auto">
        <div className="search-title">Search Shows</div>
        <div className="search-bar flex">
            <select className="search-input">
              <option>Select Category</option>
              <option>Drama</option>
              <option>Comedy</option>
              <option>Musical</option>
            </select>
          <input type="date" className="search-input" />
          <input type="text" className="search-input" placeholder="Search by title, category, or date"
          />
          <button className="search-btn">Search</button>
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
};

export default SearchShows;
