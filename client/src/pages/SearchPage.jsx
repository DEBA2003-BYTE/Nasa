import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import PaperCard from '../components/PaperCard';

function SearchPage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setPapers([]);
      return;
    }
    
    try {
      setLoading(true);
      setSearchQuery(query);
      
      const response = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setPapers(data);
    } catch (error) {
      console.error('Search error:', error);
      alert('Error performing search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search space biology publications..." 
        />
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '0.5rem 0',
      }}>
        <div style={{ fontWeight: '500' }}>
          {papers.length} {papers.length === 1 ? 'result' : 'results'} found
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      </div>

      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          padding: '3rem',
          color: '#5f6368'
        }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(0,0,0,0.1)',
            borderLeftColor: '#1a73e8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : papers.length === 0 && searchQuery ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          color: '#5f6368',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h3>No results found</h3>
          <p>Try different keywords or check your search query</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {papers.map((paper, index) => (
            <PaperCard key={paper._id || `paper-${index}`} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchPage;