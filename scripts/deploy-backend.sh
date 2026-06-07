#!/bin/bash
set -e

VERSION=${1:-"v1.0.0"}
PROJECT="project-08e33381-0c4c-46fe-a16"
REGION="europe-north1"
IMAGE="europe-north1-docker.pkg.dev/$PROJECT/roomio/backend:$VERSION"

echo "Building $IMAGE..."
docker build --platform linux/amd64 -t $IMAGE ./backend

echo "Pushing $IMAGE..."
docker push $IMAGE

echo "Deploying to Cloud Run..."
gcloud run deploy roomio-backend \
  --image=$IMAGE \
  --region=$REGION

echo "Done! Version $VERSION deployed."
