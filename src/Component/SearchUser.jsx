import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios';

const SearchForm = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter search query"
      />
      <button type="submit">Search</button>
    </form>
  );
};

const SearchCustomer = () => {
  const [results, setResults] = useState([]);
  const [sortState, setSortState] = useState('default');
  const [items, setItems] = useState([]);

  
  const handleSearch = async (query) => {
    try {
      const response = await axios.get('http://localhost:5000/api/Customers', {
        params: {
          q: query,
          sort: sortState,
        },
      });
      setResults(response.data);
      setItems(response.data.map(item => item.first_name + ' ' + item.last_name));
      console.log(items)
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleSortChange = () => {
    let newSortState;
    if (sortState === 'CustomerID') {
      newSortState = 'First Name';
    } else if (sortState === 'First Name') {
      newSortState = 'Last Name';
    } else {
      newSortState = 'CustomerID';
    }
    setSortState(newSortState);
  };

  return (
    <div>
      <SearchForm onSearch={handleSearch} />
      <button onClick={handleSortChange}>
        Sort: {sortState === 'First Name' ? 'First Name' : sortState === 'Last Name' ? 'Last Name' : 'CustomerID'}
      </button>
      <PaginatedItems itemsPerPage={10} items={items} />
    </div>
  );
};

export default SearchCustomer;

function Items({ currentItems }) {
  return (
    <>
      {currentItems &&
        currentItems.map((item, i) => (
          <div key={i}>
            <h3>{item}</h3>
          </div>
        ))}
    </>
  );
}

function PaginatedItems({ itemsPerPage, items }) {
  const [itemOffset, setItemOffset] = useState(0);

  let endOffset = itemOffset + itemsPerPage;
  let currentItems = items.slice(itemOffset, endOffset);
  let pageCount = Math.ceil(items.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    setItemOffset(newOffset);
  };

  return (
    <>
      <Items currentItems={currentItems} />
      <ReactPaginate
        breakLabel="..."
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel="< previous"
        renderOnZeroPageCount={null}
      />
    </>
  );
}
