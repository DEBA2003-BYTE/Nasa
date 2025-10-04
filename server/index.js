const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Read and parse the CSV file
const csvFilePath = path.join(__dirname, '../data/SB_publication_PMC.csv');
const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

// Parse CSV data
let papers = [];

try {
  const rows = parse(csvContent, {
    columns: ['title', 'link'], // Explicitly set column names
    skip_empty_lines: true,
    trim: true
  });

  // Transform CSV data into paper objects
  papers = rows.map((row, index) => {
    // Extract PMC ID from URL if available
    const pmcId = row.link ? row.link.match(/PMC(\d+)/)?.[0] || `pmc-${index}` : `paper-${index}`;
    
    // Extract potential year from title or other fields
    const yearMatch = row.title ? row.title.match(/(19|20)\d{2}/) : null;
    const year = yearMatch ? parseInt(yearMatch[0]) : null;
    
    // Try to extract authors if present in the title (common format: "Authors. Title")
    let authors = [];
    const titleParts = row.title ? row.title.split('.').map(s => s.trim()) : [];
    if (titleParts.length > 1) {
      authors = titleParts[0].split(',').map(a => a.trim()).filter(Boolean);
    }
    
    // Try to guess the organism based on title
    const titleLower = row.title ? row.title.toLowerCase() : '';
    let organism = '';
    if (titleLower.includes('mouse') || titleLower.includes('mice')) organism = 'mice';
    else if (titleLower.includes('drosophila') || titleLower.includes('fruit fly')) organism = 'drosophila';
    else if (titleLower.includes('plant') || titleLower.includes('arabidopsis')) organism = 'plants';
    else if (titleLower.includes('human')) organism = 'human';
    
    // Try to guess research area
    let researchArea = [];
    if (titleLower.includes('bone')) researchArea.push('bone');
    if (titleLower.includes('muscle')) researchArea.push('muscle');
    if (titleLower.includes('radiation')) researchArea.push('radiation');
    if (titleLower.includes('neuron') || titleLower.includes('brain')) researchArea.push('neuroscience');
    
    return {
      id: pmcId,
      title: row.title || '',
      url: row.link || '',
      pmcId,
      year,
      authors,
      organism,
      researchArea,
      abstract: '' // We don't have this in the CSV
    };
  });
  
  console.log(`Successfully loaded ${papers.length} papers from CSV`);
} catch (error) {
  console.error('Error parsing CSV:', error);
  process.exit(1);
}
// Simple endpoint to get all papers
app.get('/api/papers', (req, res) => {
  try {
    res.json({
      success: true,
      count: papers.length,
      data: papers
    });
  } catch (error) {
    console.error('Error getting papers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch papers'
    });
  }
});

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Search endpoint with filters
app.get('/api/search', (req, res) => {
  try {
    const { 
      query = '', 
      author = '',
      yearFrom = '', 
      yearTo = '', 
      organism = '', 
      researchArea = '' 
    } = req.query;
    
    const searchTerm = query.trim().toLowerCase();
    const authorTerm = author.trim().toLowerCase();
    const yearFromNum = yearFrom ? parseInt(yearFrom) : null;
    const yearToNum = yearTo ? parseInt(yearTo) : null;
    const organismTerm = organism.trim().toLowerCase();
    const researchAreaTerm = researchArea.trim().toLowerCase();
    
    console.log('Search params:', { searchTerm, authorTerm, yearFromNum, yearToNum, organismTerm, researchAreaTerm });
    
    // Initialize filter collections
    const allAuthors = [];
    const years = [];
    const organisms = [];
    const researchAreas = [];
    const results = [];
    
    // Single pass through papers to filter and collect filter options
    papers.forEach(paper => {
      // Text search in title (case insensitive)
      const titleMatch = !searchTerm || 
        (paper.title && paper.title.toLowerCase().includes(searchTerm));
      
      // Author filter
      const authorMatch = !authorTerm || 
        (paper.authors && paper.authors.some(a => 
          a && a.toLowerCase().includes(authorTerm)
        ));
      
      // Year range filter
      const paperYear = paper.year || 0;
      const yearMatch = 
        (!yearFromNum || paperYear >= yearFromNum) && 
        (!yearToNum || paperYear <= yearToNum);
      
      // Organism filter
      const organismMatch = !organismTerm || 
        (paper.organism && paper.organism.toLowerCase().includes(organismTerm));
      
      // Research area filter
      const researchAreaMatch = !researchAreaTerm || 
        (paper.researchArea && paper.researchArea.some(area => 
          area && area.toLowerCase().includes(researchAreaTerm)
        ));
      
      // Add to results if all filters match
      if (titleMatch && authorMatch && yearMatch && organismMatch && researchAreaMatch) {
        results.push(paper);
      }
      
      // Collect filter options (from all papers, not just filtered ones)
      // Collect authors
      if (paper.authors) {
        paper.authors.forEach(author => {
          if (author && !allAuthors.includes(author)) {
            allAuthors.push(author);
          }
        });
      }
      
      // Collect years
      if (paper.year && !years.includes(paper.year)) {
        years.push(paper.year);
      }
      
      // Collect organisms
      if (paper.organism && !organisms.includes(paper.organism)) {
        organisms.push(paper.organism);
      }
      
      // Collect research areas
      if (paper.researchArea) {
        paper.researchArea.forEach(area => {
          if (area && !researchAreas.includes(area)) {
            researchAreas.push(area);
          }
        });
      }
    });
    
    // Sort years in descending order
    years.sort((a, b) => b - a);
    
    console.log(`Search for "${searchTerm}" returned ${results.length} results`);
    
    // Return both results and filters in one response
    // Return results in the format expected by the frontend
    res.json(results);
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      details: error.message,
      results: [],
      filters: {
        authors: [],
        years: [],
        organisms: [],
        researchAreas: []
      }
    });
  }
});

// Get paper details by ID
app.get('/api/papers/:id', (req, res) => {
  try {
    const paper = papers.find(p => p.id === req.params.id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        error: 'Paper not found'
      });
    }
    res.json({
      success: true,
      data: paper
    });
  } catch (error) {
    console.error('Error getting paper:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch paper'
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Loaded ${papers.length} papers from CSV`);
  console.log(`Access the API at http://localhost:${PORT}/api/papers`);
});