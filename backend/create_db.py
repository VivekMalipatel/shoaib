"""
Database initialization script for Flask application.
This script creates the database tables if they don't exist yet.
"""
from app import create_app, db
from app.models import User, Appointment, Availability
from werkzeug.security import generate_password_hash
import json
from datetime import datetime, timedelta

app = create_app()

def create_db():
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created.")
        
        # Use the existing database and don't seed it again
        # The database is already populated by the Express backend

if __name__ == "__main__":
    create_db()