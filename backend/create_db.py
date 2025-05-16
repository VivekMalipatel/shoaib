#!/usr/bin/env python

"""
Create/reset database script.
Use this to initialize the database with tables that match our models.
"""

import os
import pathlib
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

# Manually read the .env file
env_vars = {}
with open('.env', 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#'):
            key, value = line.split('=', 1)
            os.environ[key] = value

# Now import the app modules after environment variables are loaded
from app import create_app, db

def ensure_database_exists():
    # Extract database URL and database name
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL is not set in the environment variables.")

    # Parse the database URL to separate the database name
    engine = create_engine(database_url, isolation_level='AUTOCOMMIT')
    db_name = engine.url.database

    # Temporarily connect to the default 'postgres' database
    default_engine = create_engine(engine.url.set(database='postgres'))

    with default_engine.connect() as connection:
        try:
            # Check if the database exists
            result = connection.execute(text(f"SELECT 1 FROM pg_database WHERE datname='{db_name}';"))
            if not result.fetchone():
                print(f"Database '{db_name}' does not exist. Creating it...")
                connection.execute(text(f"CREATE DATABASE {db_name};"))
                print(f"Database '{db_name}' created successfully.")
            else:
                print(f"Database '{db_name}' already exists.")
        except OperationalError as e:
            print(f"Error while checking or creating the database: {e}")
            raise

def create_database():
    # Create a Flask app context
    app = create_app()
    
    # Print which database we're using
    print(f"Using database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    with app.app_context():
        print("Dropping all tables (if they exist)...")
        db.drop_all()
        
        print("Creating all tables based on defined models...")
        db.create_all()
        
        print("Database initialized successfully!")

if __name__ == "__main__":
    ensure_database_exists()
    create_database()