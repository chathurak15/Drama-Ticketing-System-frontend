// SearchBar.jsx
import React from 'react';
import './Home.css';

const SearchShows = () => {
  return (
    <div className="search-bar-wrapper">
      <div className="search-title">Search Shows</div>
      <div className="search-bar">
        <select className="search-input">
          <option>Select Location</option>
          <option>Colombo</option>
          <option>Kandy</option>
        </select>
        <input type="date" className="search-input" />
        <input
          type="text"
          className="search-input text-field"
          placeholder="Search by title, category, or date"
        />
        <button className="search-btn">Search</button>
      </div>
    </div>

  );
};

export default SearchShows;