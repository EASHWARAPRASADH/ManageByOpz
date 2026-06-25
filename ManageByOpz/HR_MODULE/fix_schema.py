import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )
    cursor = conn.cursor()
    
    # Make workflow_definition_id nullable
    cursor.execute("ALTER TABLE workflow_instances MODIFY COLUMN workflow_definition_id binary(16) NULL")
    conn.commit()
    print("SUCCESS: workflow_instances.workflow_definition_id is now nullable")
    
    conn.close()
except Exception as e:
    print(f"ERROR: {e}")
