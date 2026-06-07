#!/bin/bash
set -e

echo "Building frontend..."
cd frontend
npm run build

echo "Deploying to Cloudflare Pages..."
wrangler pages deploy dist --project-name=roomio

echo "Done!"
