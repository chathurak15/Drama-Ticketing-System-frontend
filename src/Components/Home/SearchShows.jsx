import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCity } from "../../services/ShowService";

const SearchShows = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  
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

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city)  params.set("city",  city);
    if (date)  params.set("date",  date);
    if (title) params.set("title", title);
    navigate(`/shows?${params.toString()}`);
  };

  return (
    <div className="search-bar-wrapper">
      <div className="container mx-auto">
        <div className="search-title">Search Shows</div>
        <div className="search-bar flex">
           <select
          className="search-input px-4 py-2 border rounded flex-1"
          value={city}
          onChange={e => setCity(e.target.value)}
        >
          <option value="">Select City</option>
          {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.cityName}
          </option>
        ))}
        </select>

        <input
          type="date"
          className="search-input px-4 py-2 border rounded flex-1"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <input
          type="text"
          className="search-input px-4 py-2 border rounded flex-2"
          placeholder="Search by title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyPress={e => e.key === "Enter" && handleSearch()}
        />

        <button
          className="search-btn bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700"
          onClick={handleSearch}
        >
          Search
        </button>
        </div>
      </div>
    </div>
  );
};

export default SearchShows;