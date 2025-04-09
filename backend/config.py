import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    # Construct a proper PostgreSQL connection string if DATABASE_URL is not provided
    if os.environ.get('DATABASE_URL'):
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    else:
        # Construct from individual parts
        db_user = os.environ.get('PGUSER')
        db_password = os.environ.get('PGPASSWORD')
        db_host = os.environ.get('PGHOST')
        db_port = os.environ.get('PGPORT')
        db_name = os.environ.get('PGDATABASE')
        
        if all([db_user, db_password, db_host, db_port, db_name]):
            SQLALCHEMY_DATABASE_URI = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        else:
            # Fallback to SQLite for development
            SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)