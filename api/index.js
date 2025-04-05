// Serverless function for Vercel
const express = require('express');
const { createServer } = require('http');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');
const { json, urlencoded } = require('body-parser');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.VERCEL_URL ? [process.env.VERCEL_URL, 'https://' + process.env.VERCEL_URL] : '*',
  credentials: true
}));
app.use(json());
app.use(urlencoded({ extended: true }));

// Required for Express session
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'supermarket-stock-manager-secret';
process.env.NODE_ENV = process.env.NODE_ENV || 'production'; // Ensure proper environment for Vercel

// Import server files using require syntax
let storage, auth, routes;

try {
  // Transpile TypeScript at runtime for Vercel serverless function
  require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs',
      esModuleInterop: true,
    },
  });

  // Import our server modules
  storage = require('../server/storage');
  auth = require('../server/auth');
  routes = require('../server/routes');

  // Set up auth (passport, sessions)
  auth.setupAuth(app);

  // Register all API routes
  routes.registerRoutes(app);
} catch (error) {
  app.get('/api/health', (req, res) => {
    res.status(500).json({ 
      error: 'Server initialization failed', 
      details: error.message,
      stack: error.stack
    });
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Handle static files in production mode
if (process.env.NODE_ENV === 'production') {
  // Determine the static files path for Vercel deployment
  const staticPath = path.join(process.cwd(), 'dist/public');
  
  // Check if the directory exists
  if (fs.existsSync(staticPath)) {
    console.log('Serving static files from:', staticPath);
    app.use(express.static(staticPath));
    
    // Serve index.html for all other routes (SPA fallback)
    app.get('*', (req, res) => {
      // Only handle non-API routes
      if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(staticPath, 'index.html'));
      }
    });
  } else {
    console.warn('Static directory not found:', staticPath);
  }
}

// For Vercel serverless function
module.exports = app;