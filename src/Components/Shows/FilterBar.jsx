import React, { useState, useEffect } from "react";
import "../../assets/css/FilterBar.css";
import { getCity, getLocationByCity } from "../../services/ShowService";
import { useNavigate } from "react-router-dom";

const FilterBar = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [cities, setCities] = useState([]);
  const [venues, setVenues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await getCity();
        setCities(data);
      } catch (error) {
        console.error("Failed to load cities", error);
      }
    };
    fetchCities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setLocalFilters({
      title: "",
      date: "",
      city: "",
      venue: "",
    });
    onFilterChange({
      title: "",
      date: "",
      city: "",
      venue: "",
    });
    navigate("/shows");
  };

  
  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilterChange(localFilters);
    }, 300);
    return () => clearTimeout(timeout);
  }, [localFilters]);

  useEffect(() => {
  const fetchVenues = async () => {
    if (!localFilters.city) {
      setVenues([]);
      return;
    }
    try {
      const data = await getLocationByCity(localFilters.city);
      setVenues(data);
    } catch (error) {
      console.error("Failed to load venues", error);
    }
  };
  fetchVenues();
}, [localFilters.city]);

  return (
    <div className="filter-bar grid gap-x-2 gap-y-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
      <input
        name="title"
        placeholder="Search by title"
        value={localFilters.title}
        onChange={handleChange}
        className="filter-input px-3 py-2 rounded border border-gray-300 w-full"
      />
      <input
        type="date"
        name="date"
        value={localFilters.date}
        onChange={handleChange}
        className="filter-input px-3 py-2 rounded border border-gray-300 w-full"
      />
      <select
        name="city"
        value={localFilters.city}
        onChange={handleChange}
        className="filter-input px-3 py-2 rounded border border-gray-300 w-full"
      >
        <option value="">Select City</option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.cityName}
          </option>
        ))}
      </select>

      <select
        name="venue"
        value={localFilters.venue || ""}
        onChange={handleChange}
        className="filter-input px-3 py-2 rounded border border-gray-300 w-full"
      >
        <option value="">Select Venue</option>
        {venues.map((venue, index) => (
          <option key={index} value={venue}>
            {venue}
          </option>
        ))}
      </select>

      <div className="col-span-1 sm:col-span-2 flex items-center">
        <button
          onClick={handleClear}
          className="w-full sm:w-auto bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
