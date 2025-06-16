// SearchBar.jsx
import React from "react";

const SearchShows = () => {
  return (
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
        </div>
      </div>
    </div>
  );
};

export default SearchShows;