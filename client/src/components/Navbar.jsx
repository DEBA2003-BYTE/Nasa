import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          <h1>Space Biology Knowledge Engine</h1>
        </Link>
        <div style={{ marginTop: '0.5rem' }}>
          <Link to="/search" style={{ color: 'white', marginRight: '1rem' }}>Search</Link>
          <Link to="/about" style={{ color: 'white' }}>About</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;