const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { enhancePaperWithPublicationData, getArticlePreview } = require('./services/pmcService');

// Configuration
// No limit on number of publications, will process all available

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Path to the CSV file
const CSV_FILE_PATH = path.join(__dirname, '../data/SB_publication_PMC.csv');

// In-memory storage for papers
let papers = [];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', papersLoaded: papers.length });
});

// Get all papers
app.get('/api/papers', (req, res) => {
  res.json(papers);
});

// Search endpoint
app.get('/api/search', (req, res) => {
  const { query = '' } = req.query;
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    return res.json(papers);
  }
  
  const results = papers.filter(paper => 
    (paper.title && paper.title.toLowerCase().includes(searchTerm)) ||
    (paper.abstract && paper.abstract.toLowerCase().includes(searchTerm)) ||
    (paper.authors && paper.authors.some(author => 
      author.toLowerCase().includes(searchTerm)
    ))
  );
  
  res.json(results);
});

// Get article preview (introduction section)
app.get('/api/paper/preview/:pmcId', async (req, res) => {
  try {
    const { pmcId } = req.params;
    if (!pmcId) {
      return res.status(400).json({ error: 'PMC ID is required' });
    }
    
    const preview = await getArticlePreview(pmcId);
    res.json({ preview });
    
  } catch (error) {
    console.error('Error fetching article preview:', error);
    res.status(500).json({ 
      error: 'Failed to fetch article preview',
      details: error.message 
    });
  }
});

// Load and parse CSV file
function loadAndParseCSV() {
  try {
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.error(`Error: CSV file not found at ${CSV_FILE_PATH}`);
      return [];
    }
    
    console.log(`Loading CSV file from: ${CSV_FILE_PATH}`);
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    
    // Split by newline and clean up each line
    const lines = fileContent.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length < 2) {
      console.error('Error: CSV file is empty or has no data');
      return [];
    }
    
    // Process each line (skip header)
    const papers = [];
    const maxItems = lines.length; // Process all available items
    console.log(`Processing first ${maxItems - 1} of ${lines.length - 1} publications`);
    
    for (let i = 1; i < maxItems; i++) {
      try {
        const line = lines[i];
        const firstComma = line.indexOf(',');
        
        if (firstComma > 0) {
          const title = line.substring(0, firstComma).trim();
          const url = line.substring(firstComma + 1).trim();
          
          // Extract PMC ID from URL if available
          let pmcId = null;
          const pmcMatch = url.match(/PMC(\d+)/);
          if (pmcMatch) {
            pmcId = `PMC${pmcMatch[1]}`;
          }
          
          // Try to extract year from title
          let year = null;
          const yearMatch = title.match(/(19|20)\d{2}/);
          if (yearMatch) {
            year = parseInt(yearMatch[0]);
          }
          
          // Create paper object with default values
          const paper = {
            id: pmcId || `paper-${i}`,
            title: title || 'Untitled',
            url: url || `#`,
            pmcId,
            year,
            authors: [],
            abstract: 'Loading abstract...', // Placeholder
            source: pmcId ? 'pmc' : 'csv',
            organism: '',
            researchArea: []
          };
          
          // Try to extract authors from title (format: "Author1, Author2. Title")
          const titleParts = title.split('.').map(s => s.trim()).filter(Boolean);
          if (titleParts.length > 1) {
            paper.authors = titleParts[0].split(',').map(a => a.trim()).filter(Boolean);
            // Update title to remove authors
            paper.title = titleParts.slice(1).join('. ').trim();
          }
          
          // Guess organism based on title
          const titleLower = paper.title.toLowerCase();
          if (titleLower.includes('mouse') || titleLower.includes('mice')) {
            paper.organism = 'mice';
          } else if (titleLower.includes('drosophila') || titleLower.includes('fruit fly')) {
            paper.organism = 'drosophila';
          } else if (titleLower.includes('plant') || titleLower.includes('arabidopsis')) {
            paper.organism = 'plants';
          } else if (titleLower.includes('human')) {
            paper.organism = 'human';
          }
          
          // Guess research area based on title
          if (titleLower.includes('bone')) paper.researchArea.push('bone');
          if (titleLower.includes('muscle')) paper.researchArea.push('muscle');
          if (titleLower.includes('radiation')) paper.researchArea.push('radiation');
          if (titleLower.includes('immune')) paper.researchArea.push('immune system');
          if (titleLower.includes('microgravity')) paper.researchArea.push('microgravity');
          if (titleLower.includes('stem cell')) paper.researchArea.push('stem cells');
          
          papers.push(paper);
          
          // If this is a PMC paper, fetch additional details in the background
          if (pmcId) {
            enhancePaperWithPublicationData(paper)
              .then(enhancedPaper => {
                // Update the paper in the array with the enhanced data
                const index = papers.findIndex(p => p.id === enhancedPaper.id);
                if (index !== -1) {
                  papers[index] = { ...enhancedPaper };
                  console.log(`Fetched details for ${enhancedPaper.pmcId}`);
                }
              })
              .catch(error => {
                console.error(`Error enhancing paper ${pmcId}:`, error.message);
              });
          }
        }
      } catch (error) {
        console.error(`Error processing line ${i + 1}:`, error.message);
      }
    }
    
    console.log(`Successfully loaded ${papers.length} papers from CSV`);
    return papers;
    
  } catch (error) {
    console.error('Error loading CSV file:', error);
    return [];
  }
}

// Initialize the server
function initializeServer() {
  try {
    // Load papers from CSV
    papers = loadAndParseCSV();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`API endpoints:`);
      console.log(`- GET /api/health - Check server status`);
      console.log(`- GET /api/papers - Get all papers`);
      console.log(`- GET /api/search?query=... - Search papers`);
    });
    
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

// Start the server
initializeServer();
