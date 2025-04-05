#!/bin/bash

# This is a custom build script for Vercel deployment
# It ensures that the correct build process is followed

# Build the frontend
echo "Building frontend with Vite..."
npx vite build

# Create output directory if it doesn't exist
mkdir -p dist/public

# Ensure the build output is in the right place
if [ -d "client/dist" ]; then
  echo "Moving build files to expected location..."
  cp -r client/dist/* dist/public/
fi

echo "Build completed successfully!"
