import React, { useState } from 'react';
import PaperCard from './PaperCard';
import './ResultsTabs.css';

const ResultsTabs = ({ papers }) => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Categorize papers
  const categorizedPapers = {
    all: papers,
    pmc: papers.filter(paper => paper.pmcId && paper.pmcId.startsWith('PMC')),
    csv: papers.filter(paper => paper.source === 'csv'),
    recent: [...papers]
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .slice(0, 20) // Top 20 most recent
  };

  const tabData = [
    { id: 'all', label: 'All Results', count: categorizedPapers.all.length },
    { id: 'pmc', label: 'PMC Articles', count: categorizedPapers.pmc.length },
    { id: 'csv', label: 'CSV Import', count: categorizedPapers.csv.length },
    { id: 'recent', label: 'Most Recent', count: categorizedPapers.recent.length }
  ];

  return (
    <div className="results-container">
      <div className="tabs">
        {tabData.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>
      
      <div className="tab-content">
        {categorizedPapers[activeTab]?.length > 0 ? (
          <div className="papers-grid">
            {categorizedPapers[activeTab].map(paper => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            No papers found in this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsTabs;
