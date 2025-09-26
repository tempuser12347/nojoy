import sqlite3

def get_table_info(db_path, table_name):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    print(f"\nTable: {table_name}")
    print("----------------")
    for col in columns:
        print(f"{col[1]} ({col[2]})")
    conn.close()

tables = ['discovery', 'consumable', 'ship', 'technic', 'landnpc', 'city']
for table in tables:
    get_table_info('dhoDatabase.sqlite3', table)