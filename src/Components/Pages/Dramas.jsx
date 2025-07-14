import React, { useState,useEffect  } from 'react';
import { getDramas } from '../../services/dramaService';
import DramaCard from '../Drama/DramaCard';
import Pagination from '../Drama/Pagination';
import '../../assets/css/Dramas.css';
import { Link } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const Dramas = () => {
  const [dramas, setDramas] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // backend uses 0-based index
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const dramasPerPage = 12;

  const fetchDramas = () => {
    getDramas({
      page: currentPage,
      size: dramasPerPage,
      title: searchTerm,
      sortByRating: selectedCategory === 'Top Rated'? 'ASC' : selectedCategory === 'Newest' ? 'desc': ''
    }).then((res) => {
      const data = res.data;
      setDramas(data.content || []);
      setTotalPages(data.totalPages || 1);
    }).catch((err) => {
      console.error("Error fetching dramas", err);
    });
  };

  useEffect(() => {
    fetchDramas();
  }, [currentPage,selectedCategory]);

  const handleSearch = () => {
    setCurrentPage(0);
    fetchDramas();
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Header />
      <div className="bg-gray-100 mb-5">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="filter-bar flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">Stage Dramas</h1>
            <div>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="filter-left-bar px-2 py-2 rounded border border-gray-300">
                <option value="">Filter by default</option>
                <option value="Newest">Newest</option>
                <option value="Top Rated">Top Rated</option>
              </select>
            </div>
            <div className="filter-right flex gap-2">
              <input
                className="search-input px-2 py-2 rounded border border-gray-300"
                type="text"
                placeholder="Search by Drama Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition" onClick={handleSearch}>Search</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4">
        <div className="dramas-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {dramas.map(drama => (
            <DramaCard key={drama.id} drama={drama} />
          ))}
        </div>

        <Pagination
          totalDramas={totalPages * dramasPerPage}
          dramasPerPage={dramasPerPage}
          currentPage={currentPage + 1}
          paginate={(page) => paginate(page - 1)} // convert to 0-based
        />
      </div>
      <Footer />
    </>
  );
};

export default Dramas;
