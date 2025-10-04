# Space Biology Knowledge Engine

A web application for exploring and annotating NASA space biology research papers.

## Project Overview

This project consists of:
- React frontend built with Vite
- Node.js/Express backend
- MongoDB database (via Mongoose)
- Simple paper visualization and annotation features

## Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running locally
- Git

## Setup Instructions

1. Clone the repository and set up the server:
```bash
cd server
npm install
cp .env.example .env
```

2. Start MongoDB locally and ingest sample data:
```bash
mongod  # Start MongoDB in a separate terminal
node ingest/ingest.js ../data/pubs.csv
```

3. Start the server:
```bash
npm run start
# or for development:
npm run dev
```

4. Set up and start the client:
```bash
cd ../client
npm install
npm run dev
```

5. Open http://localhost:5173 in your browser

## Features

- Search space biology papers by title and abstract
- View detailed paper information
- Add annotations to papers
- Visualize paper relationships (basic graph view)
- Simple CSV data ingestion

## Project Structure

```
/server
  /models        - Mongoose models
  /ingest        - Data ingestion scripts
  /services      - Business logic
  index.js       - Express app setup
  
/client
  /src
    /components  - Reusable React components
    /pages       - Page components
    App.jsx      - Main app component
    
/data           - Sample data files
```

## Future Enhancements

- Enhanced paper summarization using LLMs
- Vector search for better relevance
- Advanced graph visualization
- User authentication
- Paper recommendations
- Citation network analysis

## License

MIT