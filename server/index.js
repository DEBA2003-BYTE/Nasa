const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Paper = require('./models/paper');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

const fs = require('fs');
const { parse } = require('csv-parse/sync');
const path = require('path');

// Read and parse the CSV file
const csvFilePath = path.join(__dirname, '../data/SB_publication_PMC.csv');
const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

// Parse CSV data
const papers = parse(csvContent, {
  columns: ['title', 'url'],
  skip_empty_lines: true,
  trim: true
}).map((row, index) => ({
  _id: `pmc-${index}`,
  title: row.title,
  url: row.url,
  // Extract PMC ID from URL for display
  pmcId: row.url.match(/PMC(\d+)/)?.[0] || ''
}));

// Search papers in CSV
app.get('/api/search', (req, res) => {
  try {
    const { q = '', field = 'title' } = req.query;
    const searchTerm = q.trim().toLowerCase();
    
    if (!searchTerm) {
      return res.json([]);
    }

    // Simple case-insensitive search in title by default
    const results = papers.filter(paper => 
      paper.title.toLowerCase().includes(searchTerm)
    );
    
    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ 
      error: 'Failed to perform search', 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// Get paper details
app.get('/api/paper/:id', async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    res.json(paper);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add annotation to paper
app.post('/api/paper/:id/annotate', async (req, res) => {
  try {
    const { text } = req.body;
    const paper = await Paper.findByIdAndUpdate(
      req.params.id,
      { $push: { annotations: { text } } },
      { new: true }
    );
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    res.json(paper);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/space-biology';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });