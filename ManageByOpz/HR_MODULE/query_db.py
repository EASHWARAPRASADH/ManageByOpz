import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )
    cursor = conn.cursor()
    
    print("\n--- RECOGNITION POINTS WALLETS ---")
    cursor.execute("SELECT id, tenant_id, employee_id, current_balance FROM recognition_points_wallets")
    for row in cursor.fetchall():
        print(row)
        
    conn.close()
except Exception as e:
    print(e)

