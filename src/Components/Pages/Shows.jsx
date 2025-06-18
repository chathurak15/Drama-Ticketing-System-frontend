import React, { useState, useEffect } from "react";
import FilterBar from "../Shows/FilterBar";
import ShowCard from "../Shows/ShowCard";
import "./Shows.css";
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { getShows } from "../../services/ShowService.js";
import Pagination from '../Drama/Pagination';

const ITEMS_PER_PAGE = 12;

const Shows = () => {
  const [filters, setFilters] = useState({
    title: "",
    date: "",
    city: "",
  });
  const [currentPage, setCurrentPage] = useState(0); // page 1-based for UI
  const [shows, setShows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShows = () => {
    setLoading(true);
    setError(null);
    getShows({
      page: currentPage, // backend expects 0-based
      size: ITEMS_PER_PAGE,
      title: filters.title,
      date: filters.date,
      city: filters.city,
    })
      .then((res) => {
        const data = res.data;
        setShows(data.content || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch((err) => {
        console.error("Error fetching shows", err);
        setError("Shows not found");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchShows();
  }, [currentPage, filters]);

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
    setCurrentPage(0); // reset to first page on filter change
  };

   const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Header />
      <div className="upcoming-shows container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Upcoming Shows</h1>
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading shows...
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <>
            <div className="shows-grid p-2">
              {shows.map(
                (show) => (
                  console.log("Shows array:", show),
                  (<ShowCard key={show.showId} show={show} />)
                )
              )}
            </div>

            <Pagination
          totalDramas={totalPages * ITEMS_PER_PAGE}
          dramasPerPage={ITEMS_PER_PAGE}
          currentPage={currentPage + 1}
          paginate={(page) => paginate(page - 1)} // convert to 0-based
        />
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Shows;
