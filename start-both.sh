#!/bin/bash

# Start the backend in the background
echo "Starting backend..."
cd backend && export $(grep -v '^#' .env | xargs) && python run.py &
BACKEND_PID=$!

# Wait for the backend to start
sleep 5

# Start the frontend
echo "Starting frontend..."
cd shoaib-frontend && npm start

# Kill the backend when the script is terminated
trap "kill $BACKEND_PID" EXIT