import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )

def inspect_data():
    conn = get_connection()
    cursor = conn.cursor()
    tables = [
        "organizations", "business_units", "divisions", "departments", 
        "sub_departments", "locations", "grades", "bands", 
        "designations", "cost_centers", "employment_types"
    ]
    for table in tables:
        print(f"\n=== Table: {table} ===")
        cursor.execute(f"SELECT * FROM {table}")
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        for row in rows:
            # Convert binary ids to hex
            row_formatted = []
            for col_val in row:
                if isinstance(col_val, bytes) and len(col_val) == 16:
                    row_formatted.append(col_val.hex())
                else:
                    row_formatted.append(col_val)
            print(dict(zip(columns, row_formatted)))
    conn.close()

if __name__ == "__main__":
    inspect_data()
