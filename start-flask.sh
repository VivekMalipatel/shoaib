#!/bin/bash

# Set environment variables
export FLASK_APP=backend/run.py
export FLASK_ENV=development

# First initialize the database
cd backend
python create_db.py

# Then run the application
python run.py