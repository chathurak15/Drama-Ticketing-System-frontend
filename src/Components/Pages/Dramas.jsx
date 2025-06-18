import React, { useState,useEffect  } from 'react';
import { getDramas } from '../../services/dramaService';
import DramaCard from '../Drama/DramaCard';
import Pagination from '../Drama/Pagination';
import './Dramas.css';
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
      sortByRating: selectedCategory === 'Top Rated'? 'desc' : selectedCategory === 'Newest' ? 'desc': ''
    }).then((res) => {
      const data = res.data;
      setDramas(data.content || []); // depends on your backend structure
      setTotalPages(data.totalPages || 1);
    }).catch((err) => {
      console.error("Error fetching dramas", err);
    });
  };

  useEffect(() => {
    fetchDramas();
  }, [currentPage]);

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
      <div className="bg-gray-100 h-28 mb-5">
        <div className="container mx-auto px-4 py-8">
          <div className="filter-bar flex justify-between items-center">
            <h1>Stage Dramas</h1>
            <div>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="filter-left-bar">
                <option value="">Filter by default</option>
                <option value="Newest">Newest</option>
                <option value="Top Rated">Top Rated</option>
              </select>
            </div>
            <div className="filter-right">
              <input
                className="search-input"
                type="text"
                placeholder="Search by Drama Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button" onClick={handleSearch}>Search</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="dramas-grid">
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
