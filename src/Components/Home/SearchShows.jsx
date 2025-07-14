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
    <div className="search-bar-wrapper" style={{ padding: window.innerWidth < 640 ? '16px 4px' : '24px 0' }}>
      <div className="container mx-auto">
        <div className="search-title" style={{ fontSize: window.innerWidth < 640 ? '1.2rem' : '1.5rem', marginBottom: '10px' }}>Search Shows</div>
        <div
          className="search-bar flex flex-wrap gap-2"
          style={{ justifyContent: 'center' }}
        >
          <select
            className="search-input px-3 py-2 border rounded flex-1"
            style={{ minWidth: window.innerWidth < 640 ? '100%' : '180px', fontSize: window.innerWidth < 640 ? '1rem' : '1.1rem' }}
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
            className="search-input px-3 py-2 border rounded flex-1"
            style={{ minWidth: window.innerWidth < 640 ? '100%' : '160px', fontSize: window.innerWidth < 640 ? '1rem' : '1.1rem' }}
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          <input
            type="text"
            className="search-input px-3 py-2 border rounded flex-2"
            style={{ minWidth: window.innerWidth < 640 ? '100%' : '220px', fontSize: window.innerWidth < 640 ? '1rem' : '1.1rem' }}
            placeholder="Search by title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyPress={e => e.key === "Enter" && handleSearch()}
          />

          <button
            className="search-btn bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700"
            style={{ minWidth: window.innerWidth < 640 ? '100%' : '120px', fontSize: window.innerWidth < 640 ? '1rem' : '1.1rem' }}
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