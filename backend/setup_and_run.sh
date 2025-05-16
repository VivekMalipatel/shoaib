#!/bin/bash

# Exit on error
set -e

echo "===== Backend Setup and Deployment Script ====="
echo "Setting up environment in backend folder..."

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
else
    echo "Virtual environment already exists."
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env file exists, if not create a basic one
if [ ! -f ".env" ]; then
    echo "Creating .env file with default settings..."
    cat > .env << EOL
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/docdb
SECRET_KEY=production-secret-key
JWT_SECRET_KEY=production-jwt-secret-key
EOL
    echo ".env file created. Please update it with your actual database credentials."
    exit 1
fi

# Ensure database exists
echo "Ensuring database exists..."
if ! python create_db.py; then
    echo "❌ Failed to ensure database exists. Exiting."
    exit 1
fi

# Seed the database
echo "Seeding the database with test data..."
if ! python seed_db.py; then
    echo "❌ Failed to seed the database. Exiting."
    exit 1
fi

# Start the server
echo "Starting the Flask application server..."
export FLASK_APP=run.py
export FLASK_ENV=production

# Check if port is provided as argument
if [ -n "$1" ]; then
    export PORT=$1
fi

echo "Server is starting on port ${PORT:-5001}..."
python run.py