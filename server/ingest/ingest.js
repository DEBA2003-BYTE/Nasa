const fs = require('fs');
const { parse } = require('csv-parse');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Paper = require('../models/paper');

dotenv.config();

async function ingestPapers(csvPath) {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/space-biology';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const parser = fs.createReadStream(csvPath).pipe(
      parse({
        columns: true,
        skip_empty_lines: true
      })
    );

    for await (const record of parser) {
      const paper = new Paper({
        title: record.title,
        authors: record.authors?.split(';').map(a => a.trim()) || [],
        url: record.url,
        abstract: record.abstract || '',
        tags: record.tags?.split(',').map(t => t.trim()) || []
      });

      await paper.save();
      console.log(`Ingested: ${paper.title}`);
    }

    console.log('Ingestion complete');
    process.exit(0);
  } catch (err) {
    console.error('Error during ingestion:', err);
    process.exit(1);
  }
}

if (process.argv.length < 3) {
  console.error('Usage: node ingest.js <csv_file_path>');
  process.exit(1);
}

ingestPapers(process.argv[2]);