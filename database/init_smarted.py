import sqlite3
import os

def init_db():
    db_path = 'c:/Users/SAGAR/OneDrive/Desktop/smart_Ed/database/smarted.db'
    schema_path = 'c:/Users/SAGAR/OneDrive/Desktop/smart_Ed/database/schema.sql'
    
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing {db_path}")

    conn = sqlite3.connect(db_path)
    with open(schema_path, 'r') as f:
        schema = f.read()
        conn.executescript(schema)
    
    conn.commit()
    conn.close()
    print(f"Initialized {db_path} with schema.")

if __name__ == "__main__":
    init_db()
