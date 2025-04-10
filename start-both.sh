#!/bin/sh

# Start Flask in the background
cd backend && python run.py &
FLASK_PID=$!

# Start Express in the foreground
npm run dev

# When Express terminates, also kill Flask
kill $FLASK_PID