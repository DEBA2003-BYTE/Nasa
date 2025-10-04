import React, { useState } from 'react';

const SearchBar = ({ onSearch, onFilterChange }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    author: '',
    yearFrom: '',
    yearTo: '',
    organism: '',
    researchArea: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ query, ...filters });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search space biology papers..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            <i className="fas fa-search"></i> Search
          </button>
          <button 
            type="button" 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Advanced Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Author</label>
                <input
                  type="text"
                  name="author"
                  value={filters.author}
                  onChange={handleFilterChange}
                  placeholder="Filter by author"
                />
              </div>
              
              <div className="filter-group">
                <label>Year Range</label>
                <div className="year-range">
                  <input
                    type="number"
                    name="yearFrom"
                    value={filters.yearFrom}
                    onChange={handleFilterChange}
                    placeholder="From"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    name="yearTo"
                    value={filters.yearTo}
                    onChange={handleFilterChange}
                    placeholder="To"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                  />
                </div>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Organism</label>
                <select 
                  name="organism" 
                  value={filters.organism}
                  onChange={handleFilterChange}
                >
                  <option value="">All Organisms</option>
                  <option value="mice">Mice</option>
                  <option value="drosophila">Drosophila</option>
                  <option value="plants">Plants</option>
                  <option value="human">Human</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Research Area</label>
                <select 
                  name="researchArea" 
                  value={filters.researchArea}
                  onChange={handleFilterChange}
                >
                  <option value="">All Areas</option>
                  <option value="bone">Bone Loss</option>
                  <option value="muscle">Muscle Atrophy</option>
                  <option value="radiation">Radiation Effects</option>
                  <option value="neuroscience">Neuroscience</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </form>

      <style jsx>{`
        .search-container {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .search-form {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }
        
        .search-input-container {
          display: flex;
          gap: 10px;
          margin-bottom: 1rem;
        }
        
        .search-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #dfe1e5;
          border-radius: 24px;
          font-size: 16px;
          outline: none;
          transition: all 0.3s ease;
        }
        
        .search-input:focus {
          box-shadow: 0 0 0 2px #1a73e8;
          border-color: #1a73e8;
        }
        
        .search-button, .filter-toggle {
          padding: 0 20px;
          border: none;
          border-radius: 24px;
          background-color: #1a73e8;
          color: white;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background-color 0.2s;
        }
        
        .search-button:hover, .filter-toggle:hover {
          background-color: #1557b0;
        }
        
        .filter-toggle {
          background-color: #f1f3f4;
          color: #5f6368;
        }
        
        .filter-toggle:hover {
          background-color: #e8eaed;
        }
        
        .filters-panel {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
        }
        
        .filter-row {
          display: flex;
          gap: 20px;
          margin-bottom: 1rem;
        }
        
        .filter-group {
          flex: 1;
        }
        
        .filter-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          color: #5f6368;
          font-weight: 500;
        }
        
        .filter-group input[type="text"],
        .filter-group input[type="number"],
        .filter-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #dadce0;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .year-range {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .year-range input {
          flex: 1;
        }
        
        .year-range span {
          color: #5f6368;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .filter-row {
            flex-direction: column;
            gap: 15px;
          }
          
          .search-input-container {
            flex-direction: column;
          }
          
          .search-button, .filter-toggle {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;