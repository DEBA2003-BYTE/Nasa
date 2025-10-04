import React from 'react';

function PaperCard({ paper }) {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1rem',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '0.75rem',
        fontSize: '1.25rem',
        lineHeight: '1.4',
        color: '#202124'
      }}>
        {paper.title}
      </h3>
      
      {paper.pmcId && (
        <div style={{ 
          marginBottom: '0.75rem',
          color: '#5f6368',
          fontSize: '0.875rem'
        }}>
          <strong>PMC ID:</strong> {paper.pmcId}
        </div>
      )}
      
      <a 
        href={paper.url} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          backgroundColor: '#1a73e8',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'background-color 0.2s',
          ':hover': {
            backgroundColor: '#1557b0'
          }
        }}
      >
        View on PubMed Central
      </a>
    </div>
  );
}

export default PaperCard;