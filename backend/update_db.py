from app import create_app, db
from sqlalchemy import text

# Create app context
app = create_app()
with app.app_context():
    # Add height and weight columns to users table
    try:
        # First check if columns exist
        conn = db.engine.connect()
        
        # Check if height column exists
        height_exists = conn.execute(text("SELECT 1 FROM pragma_table_info('users') WHERE name='height'")).fetchone()
        
        # Check if weight column exists
        weight_exists = conn.execute(text("SELECT 1 FROM pragma_table_info('users') WHERE name='weight'")).fetchone()
        
        # Add columns if they don't exist
        if not height_exists:
            conn.execute(text("ALTER TABLE users ADD COLUMN height FLOAT"))
            print("Added height column to users table")
        else:
            print("Height column already exists in users table")
            
        if not weight_exists:
            conn.execute(text("ALTER TABLE users ADD COLUMN weight FLOAT"))
            print("Added weight column to users table")
        else:
            print("Weight column already exists in users table")
            
        # Commit the changes
        db.session.commit()
        print("Database updated successfully!")
        
    except Exception as e:
        print(f"Error updating database: {e}")
        db.session.rollback()
