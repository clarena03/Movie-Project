import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchForm = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        className="search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter search query"
        disabled={loading} // Disable input while loading
      />
      <button type="submit" disabled={loading}>
        Search
      </button>
    </form>
  );
};

const SearchComponent = () => {
  const [results, setResults] = useState([]);
  const [sortState, setSortState] = useState('default');
  const [customerIds, setCustomerIds] = useState({}); // Store customer IDs by movie ID
  const [loading, setLoading] = useState(false); // To handle loading state
  const [errorMessage, setErrorMessage] = useState(''); // For displaying error messages
  const [query, setQuery] = useState(''); // Store query from search form

  const handleSearch = async (query) => {
    setLoading(true);
    setErrorMessage(''); // Reset error message on new search
    try {
      const response = await axios.get('http://localhost:5000/api/AllMovies', {
        params: { q: query, sort: sortState },
      });
      setResults(response.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Search failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = () => {
    // Toggle the sortState
    const nextSortState = sortState === 'Movie' ? 'Actor' : 
                          sortState === 'Actor' ? 'Genre' : 'Movie';
    
    // Set the new sort state and trigger the search with the new sorting
    setSortState(nextSortState);
    
    // Call handleSearch with the current query to re-fetch with the new sorting
    handleSearch(query); 
  };

  const handleRent = async (filmID) => {
    const custID = customerIds[filmID];
    if (!custID) {
      alert("Please enter a customer ID.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/rentMovie', {
        filmID: filmID,
        custID: custID
      });
      console.log('Rental success:', response);
      alert("Rental Successful :: Changes Will Be Reflected Upon Page Refresh");
    } catch (error) {
      console.error('Rental failed:', error);
      alert("Rental Failed");
    }
  };

  const handleCustomerIdChange = (filmID, value) => {
    setCustomerIds({
      ...customerIds,
      [filmID]: value,
    });
  };

  // Sorting button text based on current sortState
  const sortButtonText = sortState === 'Genre' ? 'Sort by Genre' : 
                        sortState === 'Actor' ? 'Sort by Actor' : 'Sort by Movie';

  return (
    <div>
      <SearchForm onSearch={handleSearch} loading={loading} />
      <button onClick={handleSortChange} disabled={loading}>
        {sortButtonText}
      </button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <ul>
        {results.map((result) => (
          <li key={result.film_id}>
            <details>
              <summary>{result.title}</summary>
              <p>Description: {result.description}</p>
              <div>Release Year: {result.release_year}</div>
              <div>Length: {result.length} Min</div>
              <div>Genre: {result.name}</div>
              <div>Rating: {result.rating}</div>
              <div>Film ID: {result.film_id}</div>
              <input
                className="new"
                type="text"
                value={customerIds[result.film_id] || ''}
                onChange={(e) => handleCustomerIdChange(result.film_id, e.target.value)}
                placeholder="Enter Customer ID"
              />
              <button onClick={() => handleRent(result.film_id)} disabled={loading || !customerIds[result.film_id]}>
                Rent
              </button>
            </details>
          </li>
        ))}
      </ul>
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default SearchComponent;
