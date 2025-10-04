const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  authors: [{
    type: String
  }],
  url: {
    type: String,
    index: true
  },
  abstract: {
    type: String,
    index: true
  },
  journal: String,
  publicationDate: Date,
  doi: String,
  keywords: [{
    type: String,
    index: true
  }],
  mission: String,
  experiment: String,
  subjects: [{
    type: String,
    index: true
  }],
  annotations: [{
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Create text index for search functionality
paperSchema.index({ 
  title: 'text', 
  abstract: 'text' 
});

module.exports = mongoose.model('Paper', paperSchema);