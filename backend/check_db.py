import sqlite3
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(backend_dir, 'database.db')

print(f"Checking SQLite database at: {db_path}")

if not os.path.exists(db_path):
    print("ERROR: Database file does not exist!")
else:
    print(f"Database file size: {os.path.getsize(db_path)} bytes")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # List tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        table_names = [t[0] for t in tables if t[0] != 'sqlite_sequence']
        print(f"Connected successfully! Found tables: {table_names}\n")
        
        for table in table_names:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"Table '{table}': {count} total records")
            
            cursor.execute(f"PRAGMA table_info({table})")
            columns = [col[1] for col in cursor.fetchall()]
            print(f"  Columns: {', '.join(columns)}")
            
            # Fetch up to 3 recent records
            cursor.execute(f"SELECT * FROM {table} ORDER BY rowid DESC LIMIT 3")
            rows = cursor.fetchall()
            if rows:
                print("  Recent records:")
                for r in rows:
                    print(f"    {r}")
            print("-" * 50)
            
        conn.close()
        print("\nDatabase health check: CONNECTED & OK!")
    except Exception as e:
        print(f"Database Connection Error: {e}")
