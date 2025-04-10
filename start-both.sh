#!/bin/sh

# Start Flask in the background
echo "Starting Flask backend..."
cd backend && python run.py &
FLASK_PID=$!

# Wait for the backend to start
sleep 2

# Start Vite development server in the foreground
echo "Starting Vite frontend..."
npm run dev

# When Vite terminates, also kill Flask
kill $FLASK_PID
