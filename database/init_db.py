import sqlite3
import os

def init_database(db_path='amep.db', schema_path='schema.sql'):
    """Initialize AMEP SQLite database from schema.sql"""
    
    if os.path.exists(db_path):
        print(f"Database {db_path} already exists. Skipping creation.")
        return
    
    with open(schema_path, 'r') as schema_file:
        schema_sql = schema_file.read()
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.executescript(schema_sql)
    
    conn.commit()
    conn.close()
    
    print(f"✅ Database {db_path} created successfully!")

if __name__ == "__main__":
    init_database()
