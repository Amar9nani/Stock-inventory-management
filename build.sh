#!/bin/bash

# This script is used by Vercel for building the application

# Ensure the api directory exists 
if [ ! -d "api" ]; then
  echo "Creating api directory"
  mkdir -p api
fi

# Ensure the output directory exists
mkdir -p dist/public

# Build the Vite frontend application
echo "Building frontend..."
NODE_ENV=production npx vite build

# Check if vite build completed successfully
if [ $? -ne 0 ]; then
  echo "Error: Vite build failed"
  exit 1
fi

echo "Frontend build completed successfully."

# Make build script executable
chmod +x ./build.sh

echo "Build process completed successfully."
