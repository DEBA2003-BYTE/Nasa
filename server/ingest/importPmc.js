const fs = require('fs');
const { parse } = require('csv-parse');
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Paper = require('../models/paper');

dotenv.config();

// PMC API base URL
const PMC_API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';

// Connect to MongoDB
async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/space-biology';
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
}

// Extract PMC ID from URL
function extractPmcId(url) {
  const match = url.match(/pmc\/articles\/PMC(\d+)/);
  return match ? match[1] : null;
}

// Fetch paper details from PMC API
async function fetchPaperDetails(pmcId) {
  try {
    const response = await axios.get(PMC_API_BASE, {
      params: {
        db: 'pmc',
        id: `PMC${pmcId}`,
        retmode: 'xml',
        tool: 'SpaceBiologyApp',
        email: process.env.EMAIL || 'your-email@example.com'
      }
    });
    
    // Parse the XML response (simplified - you might want to use an XML parser for production)
    const data = response.data;
    
    // Extract basic information (this is a simplified example)
    const title = data.match(/<article-title[^>]*>([\s\S]*?)<\/article-title>/i)?.[1] || 'Untitled';
    const abstract = data.match(/<abstract[^>]*>([\s\S]*?)<\/abstract>/i)?.[1] || '';
    
    // Extract authors (simplified)
    const authorMatches = data.match(/<contrib[^>]*?contrib-type="author"[^>]*>([\s\S]*?)<\/contrib>/gi) || [];
    const authors = authorMatches.map(author => {
      const name = author.match(/<name[^>]*>([\s\S]*?)<\/name>/i)?.[1] || 
                 author.match(/<surname[^>]*>([\s\S]*?)<\/surname>/i)?.[1] + 
                 (author.match(/<given-names[^>]*>([\s\S]*?)<\/given-names>/i) ? ' ' + 
                 author.match(/<given-names[^>]*>([\s\S]*?)<\/given-names>/i)[1] : '');
      return name.trim();
    });
    
    // Extract publication date
    const pubDate = data.match(/<pub-date[^>]*>([\s\S]*?)<\/pub-date>/i)?.[1] || '';
    const year = pubDate.match(/<year[^>]*>(\d{4})<\/year>/i)?.[1];
    const month = pubDate.match(/<month[^>]*>(\d{1,2})<\/month>/i)?.[1].padStart(2, '0') || '01';
    const day = pubDate.match(/<day[^>]*>(\d{1,2})<\/day>/i)?.[1].padStart(2, '0') || '01';
    const publicationDate = year ? new Date(`${year}-${month}-${day}`) : null;
    
    // Extract journal
    const journal = data.match(/<journal-title[^>]*>([\s\S]*?)<\/journal-title>/i)?.[1] || '';
    
    // Extract keywords
    const keywordMatches = data.match(/<kwd[^>]*>([\s\S]*?)<\/kwd>/gi) || [];
    const keywords = keywordMatches.map(kw => kw.replace(/<[^>]*>/g, '').trim()).filter(kw => kw);
    
    return {
      title: title.replace(/<[^>]*>/g, '').trim(),
      abstract: abstract.replace(/<[^>]*>/g, '').trim(),
      authors,
      journal,
      publicationDate,
      keywords,
      url: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${pmcId}/`,
      source: 'PMC',
      tags: [...new Set([...keywords, 'space-biology', 'nasa'])] // Add some default tags
    };
  } catch (error) {
    console.error(`Error fetching details for PMC${pmcId}:`, error.message);
    return null;
  }
}

// Process the CSV file
async function processCsvFile(filePath) {
  const papers = [];
  
  const parser = fs.createReadStream(filePath).pipe(
    parse({
      columns: ['title', 'url'],
      skip_empty_lines: true,
      trim: true
    })
  );

  for await (const record of parser) {
    const pmcId = extractPmcId(record.url);
    if (!pmcId) {
      console.warn(`Skipping invalid URL: ${record.url}`);
      continue;
    }
    
    console.log(`Processing: ${record.title}`);
    const paperData = await fetchPaperDetails(pmcId);
    
    if (paperData) {
      papers.push(paperData);
      console.log(`  ✓ Fetched metadata for: ${paperData.title}`);
    } else {
      // If we can't fetch metadata, at least save the basic info
      papers.push({
        title: record.title,
        url: record.url,
        authors: [],
        abstract: '',
        tags: ['space-biology', 'nasa'],
        source: 'PMC'
      });
      console.log(`  ✓ Saved basic info for: ${record.title}`);
    }
    
    // Be nice to the API - add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return papers;
}

// Save papers to database
async function savePapers(papers) {
  const results = {
    total: papers.length,
    created: 0,
    updated: 0,
    errors: 0
  };
  
  for (const paper of papers) {
    try {
      // Check if paper already exists by URL
      const existingPaper = await Paper.findOne({ url: paper.url });
      
      if (existingPaper) {
        // Update existing paper
        await Paper.updateOne({ _id: existingPaper._id }, { $set: paper });
        results.updated++;
      } else {
        // Create new paper
        await Paper.create(paper);
        results.created++;
      }
    } catch (error) {
      console.error(`Error saving paper "${paper.title}":`, error.message);
      results.errors++;
    }
  }
  
  return results;
}

// Main function
async function main() {
  try {
    const csvFilePath = process.argv[2];
    if (!csvFilePath) {
      console.error('Please provide the path to the CSV file');
      process.exit(1);
    }
    
    await connectDB();
    
    console.log('Processing CSV file...');
    const papers = await processCsvFile(csvFilePath);
    
    console.log('\nSaving papers to database...');
    const results = await savePapers(papers);
    
    console.log('\nImport completed:');
    console.log(`- Total papers processed: ${results.total}`);
    console.log(`- New papers created: ${results.created}`);
    console.log(`- Existing papers updated: ${results.updated}`);
    console.log(`- Errors: ${results.errors}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  extractPmcId,
  fetchPaperDetails,
  processCsvFile,
  savePapers
};
