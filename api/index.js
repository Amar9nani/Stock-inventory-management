// Serverless function for Vercel
const express = require('express');
const { createServer } = require('http');
const { exec } = require('child_process');
const { join } = require('path');
const cors = require('cors');
const { json, urlencoded } = require('body-parser');

const app = express();

// Middleware
app.use(cors());
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

// For Vercel serverless function
module.exports = app;