import React, { useState, useEffect } from "react";
import FilterBar from "../Shows/FilterBar";
import ShowCard from "../Shows/ShowCard";
import "../../assets/css/Shows.css";
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import { getShows } from "../../services/ShowService.js";
import Pagination from "../Drama/Pagination";

const ITEMS_PER_PAGE = 12;

const Shows = () => {
  const [filters, setFilters] = useState({
    title: "",
    date: "",
    city: "",
    venue: '',
  });
  const [currentPage, setCurrentPage] = useState(0); // page 1-based for UI
  const [shows, setShows] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShows = () => {
  setLoading(true);
  setError(null);

  // Simple artificial delay function
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  Promise.all([
    getShows({
      page: currentPage,
      size: ITEMS_PER_PAGE,
      title: filters.title,
      date: filters.date,
      city: filters.city,
      venue: filters.venue,
    }),
    delay(300),
  ])
    .then(([res]) => {
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

   if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading show details...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

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
