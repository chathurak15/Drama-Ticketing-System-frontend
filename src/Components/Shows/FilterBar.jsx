import React, { useState, useEffect } from "react";
import "../../assets/css/FilterBar.css";
import { getCity } from "../../services/ShowService";

const FilterBar = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [cities, setCities] = useState([]);

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilterChange(localFilters);
    }, 300);
    return () => clearTimeout(timeout);
  }, [localFilters]);

  return (
    <div className="filter-bar grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
      <input
        name="title"
        placeholder="Search by title"
        value={localFilters.title}
        onChange={handleChange}
        className="filter-input px-3 py-2 rounded border border-gray-300"
      />
      <input
        type="date"
        name="date"
        value={localFilters.date}
        onChange={handleChange}
        className="filter-input px-3 py-2 rounded border border-gray-300"
      />
      <select
        name="city"
        value={localFilters.city}
        onChange={handleChange}
        className="filter-input px-3 py-2 rounded border border-gray-300"
      >
        <option value="">Select City</option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.cityName}
          </option>
        ))}
      </select>
      <div className="col-span-1 md:col-span-2 flex items-center">
        <button
          onClick={() => onFilterChange(localFilters)}
          className="w-full bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
