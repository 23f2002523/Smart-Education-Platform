import sqlite3
import os
import sys

# Ensure we can import config from parent directory
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from config import Config

def get_db():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def execute_query(query, args=(), fetch_one=False, commit=False):
    """
    Execute a secure SQL query
    params: 
        query: SQL string
        args: tuple of parameters
        fetch_one: return single result (dict)
        commit: commit changes (for INSERT/UPDATE/DELETE)
    returns:
        lastrowid if commit=True
        dict if fetch_one=True
        list of dicts otherwise
    """
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(query, args)
        
        if commit:
            conn.commit()
            last_id = cursor.lastrowid
            return last_id
        
        if fetch_one:
            row = cursor.fetchone()
            return dict(row) if row else None
            
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
        
    except Exception as e:
        print(f"Database Error: {e}")
        raise e
    finally:
        conn.close()
