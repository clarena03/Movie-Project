import React, { useState, useEffect } from 'react';
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

const SearchComponent = () => {

    const [results, setResults] = useState([]);
    const [sortState, setSortState] = useState('default');
  
    const handleSearch = async (query) => {
  
      try {

        const response = await axios.get('http://localhost:5000/api/AllMovies', {
          params: { q: query,
            sort: sortState
          }
        });
  
        setResults(response.data);
  
      } catch{

      }
  
    };
  
    const handleSortChange = () => {
        if (sortState === 'Movie') {
          setSortState('Actor');
        } else if (sortState === 'Actor') {
          setSortState('Genre');
        } else {
          setSortState('Movie');
        }
      };

    return (
      <div>
  
        <SearchForm onSearch={handleSearch} />
        <button onClick={handleSortChange}>
        Sort: {sortState === 'Genre' ? 'Genre' : sortState === 'Actor' ? 'Actor' : 'Movie'}
      </button>
        <ul>
          {results.map((result) => (
            <li key={result.film_id}>
                <details>
              <summary>
                {result.title}
              </summary>
              <p>
                Description: {result.description}
              </p>
              <div>
                Release Year: {result.release_year}
              </div>
              <div>
                Length: {result.length} Min
              </div>
              <div>
                Genre: {result.name}
              </div>
              <div>
                Rating: {result.rating}
              </div>
              <div>
                Film ID: {result.film_id}
              </div>
            </details>
            </li>
          ))}
        </ul>
  
      </div>
    );
  };
  
  export default SearchComponent;