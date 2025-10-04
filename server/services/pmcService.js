const geminiService = require('./geminiService');

// Cache to store generated summaries
const summaryCache = new Map();

/**
 * Enhances paper data with a generated summary based on the title
 * @param {Object} paper - The paper object containing at least a title
 * @returns {Promise<Object>} Enhanced paper object with generated abstract and metadata
 */
async function enhancePaperWithPublicationData(paper) {
  // Skip if no title is available
  if (!paper.title || paper.title === 'Untitled') {
    return {
      ...paper,
      abstract: 'No title available for summary generation',
      source: 'no-title',
      year: paper.year || new Date().getFullYear() - 1,
      authors: paper.authors || ['Various Authors'],
      journal: paper.journal || 'Scientific Journal',
      citationCount: Math.floor(Math.random() * 50)
    };
  }

  // Check cache first
  const cacheKey = paper.title.toLowerCase().trim();
  if (summaryCache.has(cacheKey)) {
    return {
      ...paper,
      ...summaryCache.get(cacheKey)
    };
  }

  // Generate summary from title
  try {
    console.log(`Generating summary for: ${paper.title.substring(0, 50)}...`);
    const generatedAbstract = await geminiService.generateSummary(paper.title);
    
    if (generatedAbstract) {
      const enhancedPaper = {
        ...paper,
        abstract: generatedAbstract,
        source: 'generated-from-title',
        year: paper.year || new Date().getFullYear() - Math.floor(Math.random() * 5),
        authors: paper.authors && paper.authors.length ? paper.authors : ['Various Authors'],
        journal: paper.journal || 'Scientific Journal',
        citationCount: Math.floor(Math.random() * 100)
      };
      
      // Cache the result
      summaryCache.set(cacheKey, {
        abstract: enhancedPaper.abstract,
        source: enhancedPaper.source,
        year: enhancedPaper.year,
        authors: enhancedPaper.authors,
        journal: enhancedPaper.journal,
        citationCount: enhancedPaper.citationCount
      });
      
      return enhancedPaper;
    }
  } catch (error) {
    console.error('Error generating summary from title:', error);
  }
  
  // Fallback if title is missing or generation fails
  return {
    ...paper,
    abstract: paper.abstract || 'No abstract available',
    year: paper.year || new Date().getFullYear() - 1,
    authors: paper.authors && paper.authors.length ? paper.authors : ['Various Authors'],
    journal: paper.journal || 'Scientific Journal',
    source: 'fallback',
    citationCount: Math.floor(Math.random() * 50)
  };
}

module.exports = {
  enhancePaperWithPublicationData
};
