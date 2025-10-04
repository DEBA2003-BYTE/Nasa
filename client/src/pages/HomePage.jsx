import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Welcome to Space Biology Knowledge Engine</h1>
      <p style={{ margin: '2rem 0' }}>
        Explore NASA's research papers on space biology and discover new insights.
      </p>
      <div style={{ margin: '2rem 0' }}>
        <Link 
          to="/search"
          style={{
            padding: '1rem 2rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          Start Exploring
        </Link>
      </div>
    </div>
  );
}

export default HomePage;