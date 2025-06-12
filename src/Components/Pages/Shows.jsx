import React, { useState } from 'react';
import FilterBar from '../Shows/FilterBar';
import ShowCard from '../Shows/ShowCard';
import showsData from '../Shows/ShowsData.js';
import './Shows.css';
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';

const ITEMS_PER_PAGE = 12;

const Shows = () => {
  const [filters, setFilters] = useState({ title: '', date: '', city: '', location: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
    setCurrentPage(1);
  };

  const filteredShows = showsData.filter((show) => {
    return (
      show.title?.toLowerCase().includes(filters.title.toLowerCase()) &&
      (filters.date === '' || show.date === filters.date) &&
      (filters.city === '' || show.city === filters.city) &&
      (filters.location === '' || show.location === filters.location)
    );
  });

  const totalPages = Math.ceil(filteredShows.length / ITEMS_PER_PAGE);
  const currentShows = filteredShows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
      <div>
        <Header />
      </div>
      <div className="upcoming-shows">
        <h1>Upcoming Shows</h1>
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        <div className="shows-grid">
          {currentShows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
        <div className="pagination">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>&lt;</button>
          {[...Array(Math.min(totalPages, 3)).keys()].map(i => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>&gt;</button>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </>
  );
};

export default Shows;

