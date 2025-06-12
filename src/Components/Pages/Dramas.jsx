import React, { useState } from 'react';
import DramaCard from '../Drama/DramaCard';
import Pagination from '../Drama/Pagination';
import './Dramas.css';
import { Link } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';


const dramasData = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: 'Garu Katanayakathumani',
  rating: 4.8,
  category: i % 3 === 0 ? 'Newest' : 'Top Rated',
  image: `/images/drama${(i % 6) + 1}.jpg`
}));

const Dramas = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);

  const dramasPerPage = 12;

  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    category: '',
  });

  const handleSearch = () => {
    setSearchParams({
      searchTerm,
      category: selectedCategory,
    });
    setCurrentPage(1);
    setFiltersApplied(true);
  };

  const filteredDramas = dramasData.filter(drama => {
    return (
      drama.title.toLowerCase().includes(searchParams.searchTerm.toLowerCase()) &&
      (searchParams.category ? drama.category === searchParams.category : true)
    );
  });

  const indexOfLastDrama = currentPage * dramasPerPage;
  const indexOfFirstDrama = indexOfLastDrama - dramasPerPage;
  const currentDramas = filteredDramas.slice(indexOfFirstDrama, indexOfLastDrama);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Header />
      <div className="dramas-container">
        <h1>Stage Dramas</h1>

        <div className="filter-bar">
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

        <div className="dramas-grid">
          {currentDramas.map(drama => (
            <DramaCard key={drama.id} drama={drama} />
          ))}
        </div>

        <Pagination
          totalDramas={filteredDramas.length}
          dramasPerPage={dramasPerPage}
          currentPage={currentPage}
          paginate={paginate}
        />
      </div>
      <div>
        <Footer/>
      </div>
    </>
  );
};

export default Dramas;