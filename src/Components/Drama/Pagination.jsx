// src/components/Pagination.jsx
import React from 'react';
import './Pagination.css';

const Pagination = ({ totalDramas, dramasPerPage, currentPage, paginate }) => {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalDramas / dramasPerPage);

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const displayPages = pageNumbers.slice(0, 3);

  return (
    <div className="pagination">
      <button onClick={() => paginate(Math.max(currentPage - 1, 1))}>&laquo;</button>
      {displayPages.map(number => (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={currentPage === number ? 'active' : ''}
        >
          {number}
        </button>
      ))}
      <button onClick={() => paginate(Math.min(currentPage + 1, totalPages))}>&raquo;</button>
    </div>
  );
};

export default Pagination;