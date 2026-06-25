import mysql.connector

c = mysql.connector.connect(
    host='localhost',
    database='managemyopz_hr',
    user='root',
    password='Dhipak#2006#'
)
cur = c.cursor()

# Fix security_permissions: set tenant_id and version for V16 records
cur.execute("UPDATE security_permissions SET tenant_id='default', version=0 WHERE tenant_id='' OR tenant_id IS NULL OR version IS NULL")
print(f"security_permissions updated: {cur.rowcount}")

# Fix security_roles: set version where NULL
cur.execute("UPDATE security_roles SET version=0 WHERE version IS NULL")
print(f"security_roles version fixed: {cur.rowcount}")

# Fix security_modules: set tenant_id and version where empty/NULL
cur.execute("UPDATE security_modules SET tenant_id='default', version=0 WHERE tenant_id='' OR tenant_id IS NULL OR version IS NULL")
print(f"security_modules updated: {cur.rowcount}")

# Fix security_pages: set tenant_id and version where empty/NULL
cur.execute("UPDATE security_pages SET tenant_id='default', version=0 WHERE tenant_id='' OR tenant_id IS NULL OR version IS NULL")
print(f"security_pages updated: {cur.rowcount}")

c.commit()

# Verify
print("\n--- Verification ---")
cur.execute("SELECT HEX(id), permission_code, tenant_id, version, deleted FROM security_permissions LIMIT 5")
print("security_permissions sample:")
for r in cur.fetchall():
    print(f"  {r}")

cur.execute("SELECT HEX(id), role_code, tenant_id, version FROM security_roles")
print("security_roles:")
for r in cur.fetchall():
    print(f"  {r}")

c.close()
print("\nDone - all security tables fixed!")
