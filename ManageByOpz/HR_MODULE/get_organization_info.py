import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )
    cursor = conn.cursor()
    
    print("--- ORGANIZATIONS ---")
    cursor.execute("SELECT HEX(id), name, code, tenant_id FROM organizations")
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- DEPARTMENTS ---")
    cursor.execute("SELECT HEX(id), name, code, parent_department_id FROM departments")
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- DESIGNATIONS ---")
    cursor.execute("SELECT HEX(id), name, code FROM designations")
    for row in cursor.fetchall():
        print(row)

    print("\n--- ROLES ---")
    cursor.execute("SELECT HEX(id), name, code FROM roles")
    for row in cursor.fetchall():
        print(row)
        
    conn.close()
except Exception as e:
    print(e)
