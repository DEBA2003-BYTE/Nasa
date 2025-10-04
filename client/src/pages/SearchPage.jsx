import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import PaperCard from '../components/PaperCard';

function SearchPage() {
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    query: '',
    author: '',
    yearFrom: '',
    yearTo: '',
    organism: '',
    researchArea: ''
  });
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearch = async (params) => {
    if (!params.query.trim() && !params.author && !params.yearFrom && !params.yearTo && !params.organism && !params.researchArea) {
      setPapers([]);
      setFilteredPapers([]);
      return;
    }
    
    try {
      setLoading(true);
      setSearchParams(params);
      
      // Create query string from all parameters
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`http://localhost:3000/api/search?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setPapers(data);
      setFilteredPapers(data);
      
      // Update active filters for display
      const newActiveFilters = { ...params };
      delete newActiveFilters.query; // Don't show the main query in active filters
      setActiveFilters(Object.fromEntries(
        Object.entries(newActiveFilters).filter(([_, v]) => v !== '')
      ));
      
    } catch (error) {
      console.error('Search error:', error);
      alert('Error performing search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFilter = (key) => {
    const newParams = { ...searchParams, [key]: '' };
    setSearchParams(newParams);
    handleSearch(newParams);
  };

  const clearAllFilters = () => {
    const clearedParams = Object.fromEntries(
      Object.keys(searchParams).map(key => [key, ''])
    );
    setSearchParams(clearedParams);
    setPapers([]);
    setFilteredPapers([]);
    setActiveFilters({});
  };

  // Apply client-side filtering for better UX
  useEffect(() => {
    let result = [...papers];
    
    // Apply all active filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value) return;
      
      result = result.filter(paper => {
        switch(key) {
          case 'author':
            return paper.authors?.toLowerCase().includes(value.toLowerCase());
          case 'yearFrom':
            return paper.year >= parseInt(value);
          case 'yearTo':
            return paper.year <= parseInt(value);
          case 'organism':
            return paper.organism?.toLowerCase().includes(value.toLowerCase());
          case 'researchArea':
            return paper.keywords?.some(kw => 
              kw.toLowerCase().includes(value.toLowerCase())
            ) || 
            paper.title.toLowerCase().includes(value.toLowerCase()) ||
            paper.abstract?.toLowerCase().includes(value.toLowerCase());
          default:
            return true;
        }
      });
    });
    
    setFilteredPapers(result);
  }, [papers, activeFilters]);

  return (
    <div className="search-page">
      <div className="search-container">
        <SearchBar 
          onSearch={handleSearch} 
          onFilterChange={(filters) => setSearchParams(prev => ({ ...prev, ...filters }))}
        />
      </div>
      
      {/* Active Filters */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="active-filters">
          <div className="filters-header">
            <h3>Active Filters</h3>
            <button onClick={clearAllFilters} className="clear-all">
              Clear All
            </button>
          </div>
          <div className="filter-tags">
            {Object.entries(activeFilters).map(([key, value]) => (
              value && (
                <span key={key} className="filter-tag">
                  {key}: {value}
                  <button onClick={() => removeFilter(key)}>×</button>
                </span>
              )
            ))}
          </div>
        </div>
      )}
      
      {/* Search Results */}
      <div className="results-container">
        <div className="results-header">
          <h2>
            {searchParams.query 
              ? `Search results for "${searchParams.query}"` 
              : 'Search for space biology publications'}
            {Object.keys(activeFilters).length > 0 && ` (${filteredPapers.length} found)`}
          </h2>
          
          {loading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <span>Searching...</span>
            </div>
          )}
        </div>
        
        {!loading && filteredPapers.length > 0 ? (
          <div className="papers-grid">
            {filteredPapers.map((paper, index) => (
              <PaperCard key={paper.id || index} paper={paper} />
            ))}
          </div>
        ) : searchParams.query || Object.keys(activeFilters).length > 0 ? (
          <div className="no-results">
            <p>No results found for your search criteria.</p>
            <button onClick={clearAllFilters} className="clear-search">
              Clear search and filters
            </button>
          </div>
        ) : (
          <div className="welcome-message">
            <h3>Welcome to NASA Space Biology Search</h3>
            <p>Start by entering a search term or using the advanced filters to find relevant publications.</p>
            <div className="search-tips">
              <h4>Search Tips:</h4>
              <ul>
                <li>Use specific terms like "bone loss in microgravity"</li>
                <li>Filter by author, publication year, or research area</li>
                <li>Combine multiple filters for precise results</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .search-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }
        
        .search-container {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
          overflow: hidden;
        }
        
        .active-filters {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .filters-header h3 {
          margin: 0;
          font-size: 1rem;
          color: #3c4043;
        }
        
        .clear-all {
          background: none;
          border: none;
          color: #1a73e8;
          cursor: pointer;
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }
        
        .clear-all:hover {
          background: rgba(26, 115, 232, 0.08);
        }
        
        .filter-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .filter-tag {
          background: #e8f0fe;
          color: #1967d2;
          padding: 0.375rem 0.75rem;
          border-radius: 16px;
          font-size: 0.875rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .filter-tag button {
          background: none;
          border: none;
          color: #5f6368;
          cursor: pointer;
          font-size: 1.25rem;
          line-height: 1;
          padding: 0 0.25rem;
          margin-left: 0.25rem;
        }
        
        .results-container {
          background: #fff;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .results-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .results-header h2 {
          margin: 0 0 1rem 0;
          color: #202124;
          font-size: 1.5rem;
          font-weight: 400;
        }
        
        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #5f6368;
          font-size: 0.875rem;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(26, 115, 232, 0.2);
          border-radius: 50%;
          border-top-color: #1a73e8;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .papers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .no-results, .welcome-message {
          text-align: center;
          padding: 3rem 1rem;
          color: #5f6368;
        }
        
        .no-results p {
          margin-bottom: 1.5rem;
        }
        
        .clear-search, .clear-all {
          background: #1a73e8;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .clear-search:hover, .clear-all:hover {
          background: #1557b0;
        }
        
        .welcome-message h3 {
          color: #202124;
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          font-weight: 400;
        }
        
        .search-tips {
          max-width: 500px;
          margin: 2rem auto 0;
          text-align: left;
          background: #f8f9fa;
          padding: 1.25rem;
          border-radius: 8px;
        }
        
        .search-tips h4 {
          margin: 0 0 0.75rem 0;
          color: #3c4043;
          font-size: 1rem;
        }
        
        .search-tips ul {
          margin: 0;
          padding-left: 1.25rem;
          color: #5f6368;
        }
        
        .search-tips li {
          margin-bottom: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .papers-grid {
            grid-template-columns: 1fr;
          }
          
          .search-page {
            padding: 0.5rem;
          }
          
          .results-container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default SearchPage;