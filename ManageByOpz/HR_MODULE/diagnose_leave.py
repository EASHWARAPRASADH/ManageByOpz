import urllib.request
import json
import mysql.connector

# 1. Auth
req = urllib.request.Request(
    'http://localhost:8080/api/v1/auth/login',
    data=json.dumps({'email':'admin@managemyopz.com','password':'Admin@123'}).encode('utf-8'),
    headers={'Content-Type':'application/json'}, method='POST'
)
resp = json.loads(urllib.request.urlopen(req, timeout=10).read().decode('utf-8'))
token = resp['accessToken']
print('Admin Token obtained.')

# 2. Get first employee
req2 = urllib.request.Request(
    'http://localhost:8080/api/v1/employees',
    headers={'Authorization':'Bearer '+token,'X-Tenant-Id':'ACME','Content-Type':'application/json'},
    method='GET'
)
emps = json.loads(urllib.request.urlopen(req2, timeout=10).read().decode('utf-8'))
first = emps['data'][0]
print(f"First Employee: {first['id']} / {first.get('workEmail')}")

# 3. DB diagnostics
conn = mysql.connector.connect(host='localhost', user='root', password='Dhipak#2006#', database='managemyopz_hr')
cur = conn.cursor()

# User <-> Employee mappings
cur.execute('SELECT HEX(id), username, employee_id, status FROM users WHERE employee_id IS NOT NULL LIMIT 5')
rows = cur.fetchall()
print('\n=== User <-> EmployeeID mappings ===')
for r in rows:
    print(f'  UserID: {r[0]}, Username: {r[1]}, EmployeeID: {r[2]}, Status: {r[3]}')

# Leave balances
cur.execute('SELECT COUNT(*) FROM leave_balances WHERE deleted=0')
print(f'\nTotal leave balance records: {cur.fetchone()[0]}')

cur.execute('''
    SELECT HEX(lb.employee_id), lt.name, lb.year, lb.total_allocated, lb.balance 
    FROM leave_balances lb JOIN leave_types lt ON lb.leave_type_id=lt.id 
    WHERE lb.deleted=0 LIMIT 10
''')
rows2 = cur.fetchall()
print('\n=== Leave Balances ===')
for r in rows2:
    print(f'  Emp: {r[0]}, Type: {r[1]}, Year: {r[2]}, Allocated: {r[3]}, Balance: {r[4]}')

# Leave permissions
cur.execute("SELECT COUNT(*) FROM permissions WHERE permission_key LIKE 'LEAVE%%' AND deleted=0")
print(f'\nLeave permissions in DB: {cur.fetchone()[0]}')

cur.execute("SELECT HEX(rp.role_id), p.permission_key FROM role_permissions rp JOIN permissions p ON rp.permission_id=p.id WHERE p.permission_key LIKE 'LEAVE%%'")
rp = cur.fetchall()
print('\n=== Role-Permission Mappings ===')
for r in rp:
    print(f'  RoleID: {r[0]}, Permission: {r[1]}')

# Roles
cur.execute('SELECT HEX(id), code FROM roles')
roles = cur.fetchall()
print('\n=== Roles ===')
for r in roles:
    print(f'  ID: {r[0]}, Code: {r[1]}')

# Role->Permission Join Details for ROLE_EMPLOYEE
cur.execute("SELECT HEX(r.id) FROM roles r WHERE r.code='ROLE_EMPLOYEE'")
emp_role = cur.fetchone()
if emp_role:
    emp_role_id = emp_role[0]
    print(f'\nROLE_EMPLOYEE ID: {emp_role_id}')
    cur.execute(f"SELECT p.permission_key FROM role_permissions rp JOIN permissions p ON rp.permission_id=p.id WHERE HEX(rp.role_id)='{emp_role_id}'")
    perms = cur.fetchall()
    print(f'Permissions assigned to ROLE_EMPLOYEE ({len(perms)}):')
    for p in perms:
        print(f'  - {p[0]}')

# Leave types
cur.execute("SELECT HEX(id), name, code, active, default_days FROM leave_types WHERE deleted=0")
lt_rows = cur.fetchall()
print(f'\n=== Leave Types ({len(lt_rows)}) ===')
for r in lt_rows:
    print(f'  ID: {r[0]}, Name: {r[1]}, Code: {r[2]}, Active: {r[3]}, DefaultDays: {r[4]}')

conn.close()
