#!/usr/bin/env python

from app import db, create_app
from sqlalchemy import text

def test_db_connection():
    """Test the database connection using the configured DATABASE_URL."""
    try:
        print("Attempting to connect to the database...")
        app = create_app()
        with app.app_context():
            # Try executing a simple query
            result = db.session.execute(text('SELECT 1'))
            print(f"Result: {result.scalar()}")
            print("✅ Database connection successful!")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_db_connection()