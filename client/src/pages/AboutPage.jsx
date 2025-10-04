import React from 'react';

function AboutPage() {
  return (
    <div>
      <h1>About Space Biology Knowledge Engine</h1>
      
      <section style={{ margin: '2rem 0' }}>
        <h2>Project Overview</h2>
        <p>
          The Space Biology Knowledge Engine is a tool for exploring NASA's research 
          papers on space biology. It aims to make space biology research more 
          accessible and interconnected.
        </p>
      </section>

      <section style={{ margin: '2rem 0' }}>
        <h2>Features</h2>
        <ul style={{ marginLeft: '2rem' }}>
          <li>Search through NASA space biology publications</li>
          <li>View detailed paper information and abstracts</li>
          <li>Add annotations to papers for personal reference</li>
          <li>Visualize connections between papers</li>
        </ul>
      </section>

      <section style={{ margin: '2rem 0' }}>
        <h2>Data Sources</h2>
        <p>
          Our database includes publications from various NASA research centers 
          and affiliated institutions. The data is regularly updated to include 
          new research in space biology.
        </p>
      </section>

      {/* TODO: Add more sections about space biology research */}
    </div>
  );
}

export default AboutPage;