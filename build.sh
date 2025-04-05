#!/bin/bash

# This script is used by Vercel for building the application

# Ensure the output directory exists
mkdir -p dist/public

# Build the Vite frontend application
NODE_ENV=production npx vite build

# Check if vite build completed successfully
if [ $? -ne 0 ]; then
  echo "Error: Vite build failed"
  exit 1
fi

echo "Frontend build completed successfully."

# Build server for production
NODE_ENV=production npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Check if server build completed successfully
if [ $? -ne 0 ]; then
  echo "Error: Server build failed"
  exit 1
fi

echo "Server build completed successfully."
echo "Build process completed."
