import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )
    cursor = conn.cursor()
    
    print("--- LATEST USER DETAILS ---")
    cursor.execute("SELECT HEX(id), username, email, employee_id, status, activation_token, activation_token_expiry FROM users ORDER BY created_at DESC LIMIT 1")
    for row in cursor.fetchall():
        print(row)
        latest_username = row[1]
        
    print("\n--- ALL COLUMNS ---")
    cursor.execute("DESCRIBE users")
    columns = [row[0] for row in cursor.fetchall()]
    
    cursor.execute(f"SELECT * FROM users WHERE username = '{latest_username}'")
    for row in cursor.fetchall():
        for col, val in zip(columns, row):
            print(f"  {col}: {val}")
            
    conn.close()
except Exception as e:
    print(e)
