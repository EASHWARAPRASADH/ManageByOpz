import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )
    cursor = conn.cursor()
    
    # Fix recognition_values
    try:
        cursor.execute("ALTER TABLE recognition_values DROP INDEX code")
        print("Dropped unique key code from recognition_values")
    except Exception as e:
        print("Error dropping key from recognition_values:", e)
        
    try:
        cursor.execute("ALTER TABLE recognition_values ADD UNIQUE KEY uq_recognition_values_tenant_code (tenant_id, code)")
        print("Added composite unique key (tenant_id, code) to recognition_values")
    except Exception as e:
        print("Error adding key to recognition_values:", e)

    # Fix recognition_types
    try:
        cursor.execute("ALTER TABLE recognition_types DROP INDEX code")
        print("Dropped unique key code from recognition_types")
    except Exception as e:
        print("Error dropping key from recognition_types:", e)
        
    try:
        cursor.execute("ALTER TABLE recognition_types ADD UNIQUE KEY uq_recognition_types_tenant_code (tenant_id, code)")
        print("Added composite unique key (tenant_id, code) to recognition_types")
    except Exception as e:
        print("Error adding key to recognition_types:", e)

    conn.commit()
    conn.close()
except Exception as e:
    print(e)
