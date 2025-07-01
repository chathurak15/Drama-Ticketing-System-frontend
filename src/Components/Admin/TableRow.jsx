import React from 'react';

const TableRow = ({ children, className = "", hover = true }) => (
  <tr className={`border-b ${hover ? 'hover:bg-gray-50' : ''} ${className}`}>
    {children}
  </tr>
);

export default TableRow;