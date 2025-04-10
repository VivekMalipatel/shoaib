#!/usr/bin/env python

"""
Create/reset database script.
Use this to initialize the database with tables that match our models.
"""

from app import create_app, db
import os

def create_database():
    # Create a Flask app context
    app = create_app()
    
    with app.app_context():
        print("Dropping all tables (if they exist)...")
        db.drop_all()
        
        print("Creating all tables based on defined models...")
        db.create_all()
        
        print("Database initialized successfully!")

if __name__ == "__main__":
    create_database()