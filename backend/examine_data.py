import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dhoDatabase.sqlite3')

def examine_table(table_name):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get column names
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [col[1] for col in cursor.fetchall()]
    
    # Get first row of data
    cursor.execute(f"SELECT * FROM {table_name} LIMIT 1")
    row = cursor.fetchone()
    
    print(f"\nTable: {table_name}")
    print("----------------")
    if columns and row:
        for col, val in zip(columns, row):
            print(f"{col}: {val}")
    else:
        print("No data or columns found")
    
    conn.close()

tables = ['discovery', 'consumable', 'ship', 'technic', 'landnpc', 'city']
for table in tables:
    examine_table(table)