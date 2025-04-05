// This file is used to configure the build process for Vercel deployment
// It sets up environment variables and configuration options for the build

// Provides a custom build command that Vercel can use
module.exports = {
  buildCommand: 'vite build',
  outputDirectory: 'dist/public',
  devCommand: 'npm run dev',
  installCommand: 'npm install',
};