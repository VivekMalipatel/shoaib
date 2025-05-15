# check_tables.py

import os
from sqlalchemy import inspect

# Load env vars
with open('.env', 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#'):
            key, value = line.split('=', 1)
            os.environ[key] = value

from app import db, create_app

app = create_app()
with app.app_context():
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    if 'users' in tables:
        print("Database tables already exist.")
        exit(0)
    else:
        print("Tables do not exist. Need to create them.")
        exit(2)