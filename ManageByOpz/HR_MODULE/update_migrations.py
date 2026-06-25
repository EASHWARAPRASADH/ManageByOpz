import mysql.connector
import os

try:
    # 1. Update DB
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )
    cursor = conn.cursor()
    cursor.execute("UPDATE flyway_schema_history SET version='3.2', script='V3_2__seed_rbac.sql' WHERE version='4'")
    conn.commit()
    print("Database updated: version 4 changed to 3.2 in flyway_schema_history.")
    conn.close()

    # 2. Rename File
    src = r"d:\ManageMyOpz\HR_Module_02\hrms-platform\backend\app-bootstrap\src\main\resources\db\migration\V4__seed_rbac.sql"
    dst = r"d:\ManageMyOpz\HR_Module_02\hrms-platform\backend\app-bootstrap\src\main\resources\db\migration\V3_2__seed_rbac.sql"
    
    if os.path.exists(src):
        os.rename(src, dst)
        print("File renamed successfully from V4__seed_rbac.sql to V3_2__seed_rbac.sql.")
    else:
        print("Source file V4__seed_rbac.sql does not exist, check if already renamed.")
        
except Exception as e:
    print("Error:", e)
