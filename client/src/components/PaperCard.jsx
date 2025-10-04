import React, { useState, useEffect } from 'react';
import './PaperCard.css';

function PaperCard({ paper }) {
  // Format the publication date if available
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // State to track abstract UI states
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const abstractRef = React.useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if abstract needs truncation and handle loading state
  useEffect(() => {
    if (paper.abstract === 'Loading abstract...') {
      setIsLoading(true);
      setNeedsTruncation(false);
    } else if (paper.abstract && paper.abstract !== 'No abstract available') {
      setIsLoading(false);
      const wordCount = paper.abstract.split(' ').length;
      setNeedsTruncation(wordCount > 50);
    } else {
      setIsLoading(false);
      setNeedsTruncation(false);
    }
  }, [paper.abstract]);

  // Function to get first 50 words of the abstract
  const getAbstractPreview = (abstract) => {
    if (!abstract) return '';
    const words = abstract.split(' ');
    if (words.length <= 50) return abstract;
    return words.slice(0, 50).join(' ') + '...';
  };

  // Toggle expanded state
  const toggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Get the source badge color based on the source
  const getSourceBadgeColor = (source) => {
    switch (source) {
      case 'pmc':
        return 'bg-blue-100 text-blue-800';
      case 'csv':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="paper-card">
      <div className="paper-header">
        <h3 className="paper-title">{paper.title || 'Untitled'}</h3>
        {paper.source && (
          <span className={`source-badge ${getSourceBadgeColor(paper.source)}`}>
            {paper.source.toUpperCase()}
          </span>
        )}
      </div>
      
      <div className="paper-meta">
        {paper.authors?.length > 0 && (
          <div className="meta-item">
            <span className="meta-label">Authors:</span>
            <span className="meta-value">{paper.authors.join(', ')}</span>
          </div>
        )}
        
        {(paper.year || paper.publicationDate) && (
          <div className="meta-item">
            <span className="meta-label">Published:</span>
            <span className="meta-value">
              {paper.publicationDate ? formatDate(paper.publicationDate) : paper.year}
            </span>
          </div>
        )}
        
        {paper.organism && (
          <div className="meta-item">
            <span className="meta-label">Organism:</span>
            <span className="meta-value">{paper.organism}</span>
          </div>
        )}
        
        {paper.researchArea?.length > 0 && (
          <div className="meta-item">
            <span className="meta-label">Research Areas:</span>
            <div className="research-areas">
              {paper.researchArea.map((area, index) => (
                <span key={index} className="research-tag">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {paper.pmcId && (
          <div className="meta-item">
            <span className="meta-label">PMC ID:</span>
            <span className="meta-value">{paper.pmcId}</span>
          </div>
        )}
        
        {paper.doi && (
          <div className="meta-item">
            <span className="meta-label">DOI:</span>
            <a 
              href={`https://doi.org/${paper.doi}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {paper.doi}
            </a>
          </div>
        )}
      </div>
            {/* Abstract section */}
      <div className="paper-abstract">
        <h4 className="abstract-label">Abstract</h4>
        <div className="abstract-text" ref={abstractRef}>
          {isLoading ? (
            <div className="text-gray-500 italic">Loading abstract...</div>
          ) : paper.abstract && paper.abstract !== 'No abstract available' ? (
            <>
              {isExpanded ? (
                <p>{paper.abstract}</p>
              ) : (
                <p>
                  {getAbstractPreview(paper.abstract)}
                  {needsTruncation && (
                    <button 
                      onClick={toggleExpand}
                      aria-expanded="false"
                      aria-label="Read more"
                      className="text-blue-600 hover:underline ml-1 focus:outline-none"
                    >
                      Read more
                    </button>
                  )}
                </p>
              )}
              {isExpanded && needsTruncation && (
                <button 
                  onClick={toggleExpand}
                  className="show-less-btn text-blue-600 hover:underline mt-2 text-sm focus:outline-none"
                  aria-expanded="true"
                  aria-label="Show less"
                >
                  Show less
                </button>
              )}
            </>
          ) : (
            <div className="text-gray-500">No abstract available</div>
          )}
        </div>
      </div>
      
      <div className="paper-actions">
        <a 
          href={paper.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="view-button"
        >
          {paper.pmcId ? 'View on PubMed Central' : 'View Paper'}
        </a>
      </div>
    </div>
  );
}

export default PaperCard;