// SearchBar.jsx
import React from 'react';
import './Home.css';

const SearchShows = () => {
  return (
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
        </div>
      </div>
    </div>
  );
};

export default SearchShows;