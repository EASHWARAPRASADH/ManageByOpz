import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )
    cursor = conn.cursor()
    
    cursor.execute("SHOW TABLES")
    tables = [row[0] for row in cursor.fetchall()]
    
    for table in tables:
        # Check if the table has a 'version' column
        cursor.execute(f"SHOW COLUMNS FROM `{table}` LIKE 'version'")
        if cursor.fetchone():
            cursor.execute(f"SELECT COUNT(*) FROM `{table}` WHERE `version` IS NULL")
            count = cursor.fetchone()[0]
            if count > 0:
                print(f"Table `{table}` has {count} rows with version IS NULL")
                cursor.execute(f"SELECT id FROM `{table}` WHERE `version` IS NULL LIMIT 5")
                for row in cursor.fetchall():
                    print(f"  - HEX(id) = {row[0].hex() if isinstance(row[0], bytes) else row[0]}")
                    
    conn.close()
except Exception as e:
    print(e)
