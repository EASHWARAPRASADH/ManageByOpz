import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )
    cursor = conn.cursor()
    
    # 1. Update version to 0 in employee_code_sequences where version is null
    cursor.execute("UPDATE employee_code_sequences SET version = 0 WHERE version IS NULL")
    print(f"Updated {cursor.rowcount} rows in employee_code_sequences")
    
    # 2. Let's do it for any other tables that might have been missed
    cursor.execute("SHOW TABLES")
    tables = [row[0] for row in cursor.fetchall()]
    
    for table in tables:
        cursor.execute(f"SHOW COLUMNS FROM `{table}` LIKE 'version'")
        if cursor.fetchone():
            cursor.execute(f"UPDATE `{table}` SET `version` = 0 WHERE `version` IS NULL")
            if cursor.rowcount > 0:
                print(f"Updated {cursor.rowcount} rows in `{table}`")
                
    conn.commit()
    conn.close()
except Exception as e:
    print(e)
