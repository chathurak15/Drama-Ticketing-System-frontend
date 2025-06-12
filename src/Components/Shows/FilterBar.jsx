import React, { useState } from 'react';
import './FilterBar.css';

const FilterBar = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (e) => {
    setLocalFilters({ ...localFilters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    onFilterChange(localFilters);
  };

  return (
    <div className="filter-bar">
      <input name="title" placeholder="Search by title" value={localFilters.title} onChange={handleChange} className="filter-title-bar"/>
      <input type="date" name="date" value={localFilters.date} onChange={handleChange} className="filter-date-bar"/>
      <input name="city" placeholder="Select City" value={localFilters.city} onChange={handleChange} className="filter-city-bar"/>
      <input name="location" placeholder="Select Location" value={localFilters.location} onChange={handleChange} className="filter-location-bar"/>
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default FilterBar;