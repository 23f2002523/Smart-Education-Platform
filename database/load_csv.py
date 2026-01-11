import pandas as pd
import sqlite3
import os

def load_csv_to_db(db_path='amep.db', csv_dir='../ml/datasets'):
    """Load CSV files into SQLite database"""
    
    if not os.path.exists(db_path):
        print(f"❌ Database {db_path} does not exist. Run init_db.py first.")
        return
    
    conn = sqlite3.connect(db_path)
    
    csv_mappings = {
        'student.csv': 'students',
        'quizattempts_fixed.csv': 'quiz_attempts',
        'projectactivities_fixed.csv': 'project_activity',
        'masterylabels_fixed.csv': 'mastery_scores'
    }
    
    for csv_file, table_name in csv_mappings.items():
        csv_path = os.path.join(csv_dir, csv_file)
        
        if not os.path.exists(csv_path):
            print(f"⚠️  {csv_file} not found, skipping...")
            continue
        
        df = pd.read_csv(csv_path)
        
        df.to_sql(table_name, conn, if_exists='append', index=False)
        
        print(f"✅ Loaded {len(df)} rows into {table_name}")
    
    conn.close()
    print("\n✅ All CSV data loaded successfully!")

if __name__ == "__main__":
    load_csv_to_db()
