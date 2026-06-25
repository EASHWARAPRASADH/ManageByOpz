import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )
    cursor = conn.cursor()
    
    print("--- RECENTLY PROVISIONED USERS ---")
    cursor.execute("SELECT HEX(id), username, email, employee_id, status, activation_token, activation_token_expiry FROM users ORDER BY created_at DESC LIMIT 5")
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- NOTIFICATIONS SENT ---")
    cursor.execute("SELECT HEX(id), recipient_email, template_code, subject, body, status FROM notifications ORDER BY created_at DESC LIMIT 5")
    for row in cursor.fetchall():
        print(row)
        
    conn.close()
except Exception as e:
    print(e)
