<<<<<<< HEAD
#!/bin/sh

# Start Flask in the background
cd backend && python run.py &
FLASK_PID=$!

# Start Express in the foreground
npm run dev

# When Express terminates, also kill Flask
kill $FLASK_PID
=======
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
>>>>>>> 4ebda91af98a70c687679e59ca0d831b3d78bc79
