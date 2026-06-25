import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )
    cursor = conn.cursor()
    
    # Check if created_at exists in field_permissions
    cursor.execute("DESCRIBE field_permissions")
    columns = [row[0] for row in cursor.fetchall()]
    
    if 'created_at' not in columns:
        print("Adding created_at column to field_permissions...")
        cursor.execute("ALTER TABLE field_permissions ADD COLUMN created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)")
        conn.commit()
        print("Column added successfully!")
    else:
        print("created_at column already exists in field_permissions.")
        
    conn.close()
except Exception as e:
    print("Error:", e)
