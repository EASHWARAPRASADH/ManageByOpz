import urllib.request
import urllib.parse
import urllib.error
import json
import sys
import time
from datetime import datetime

ADMIN_EMAIL = "ultra.admin@managemyopz.com"
ADMIN_PASSWORD = "Admin@123"

def query_db(query, params=None):
    import mysql.connector
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query, params or ())
    
    query_upper = query.strip().upper()
    if query_upper.startswith("DELETE") or query_upper.startswith("UPDATE") or query_upper.startswith("INSERT"):
        conn.commit()
        results = None
    else:
        results = cursor.fetchall()
        
    conn.close()
    return results

def post_request(url, data, headers):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8') if data is not None else b"",
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode('utf-8')), resp.getcode()
    except urllib.error.HTTPError as err:
        try:
            return json.loads(err.read().decode('utf-8')), err.code
        except Exception:
            return {"message": str(err)}, err.code

def put_request(url, data, headers):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8') if data is not None else b"",
        headers=headers,
        method='PUT'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode('utf-8')), resp.getcode()
    except urllib.error.HTTPError as err:
        try:
            return json.loads(err.read().decode('utf-8')), err.code
        except Exception:
            return {"message": str(err)}, err.code

def get_request(url, headers):
    req = urllib.request.Request(
        url,
        headers=headers,
        method='GET'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode('utf-8')), resp.getcode()
    except urllib.error.HTTPError as err:
        try:
            return json.loads(err.read().decode('utf-8')), err.code
        except Exception:
            return {"message": str(err)}, err.code

def main():
    print("=== STARTING PHASE 2 HOLIDAY CALENDAR & LEAVE POLICY ENGINE TESTS ===")

    # 1. Login
    print("\n[Test 1] Authenticating as Admin...")
    auth_url = "http://localhost:8080/api/v1/auth/login"
    login_payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    headers = {'Content-Type': 'application/json'}
    resp_data, code = post_request(auth_url, login_payload, headers)
    if code != 200:
        print(f"Failed: Login returned status code {code}")
        sys.exit(1)
    token = resp_data.get("accessToken")
    auth_headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    print("Successfully authenticated.")

    # 2. Setup Test Data
    print("\n[Test 2] Setting up Test Organization and Grade...")
    org_id = "36bf4b42-eab9-4a95-ab0a-bad239026ed0"
    grade_id = "1eac5b63-090f-49aa-b2e2-bbec12678bc0"
    
    # Get active employee
    dir_url = "http://localhost:8080/api/v1/employees"
    resp_data, _ = get_request(dir_url, auth_headers)
    employees = resp_data.get("data", [])
    employee = None
    for emp in employees:
        f_name = emp.get("firstName") or ""
        if f_name.strip() not in ["", "Unauthorized"]:
            employee = emp
            break
            
    if not employee:
        print("No valid employees found in directory.")
        sys.exit(1)
        
    emp_id = employee.get("id")
    print(f"Using employee ID: {emp_id}")

    # Link employee to organization and grade for the test
    query_db("UPDATE employee_twins SET organization_id = UUID_TO_BIN(%s), grade_id = UUID_TO_BIN(%s) WHERE id = UUID_TO_BIN(%s)", (org_id, grade_id, emp_id))
    print("Linked employee twin to Test Org and Grade.")

    # Clean up existing calendars and policy setups
    query_db("DELETE FROM holiday_calendar_days")
    query_db("DELETE FROM holiday_calendars")
    query_db("DELETE FROM leave_policy_assignments")
    query_db("DELETE FROM leave_policy_rules")
    query_db("DELETE FROM leave_policies")

    # 3. Create Holiday Calendar
    print("\n[Test 3] Creating Holiday Calendar...")
    calendar_payload = {
        "calendarName": "Acme Holiday Calendar 2026",
        "country": "US",
        "state": "CA",
        "year": 2026,
        "organizationId": org_id,
        "active": True
    }
    resp_data, code = post_request("http://localhost:8080/api/v1/holiday-calendars", calendar_payload, auth_headers)
    if code != 201:
        print(f"Failed to create holiday calendar: {code} {resp_data}")
        sys.exit(1)
    
    calendar_id = resp_data.get("data", {}).get("id")
    print(f"Created Holiday Calendar. ID: {calendar_id}")

    # Add a holiday on 2026-12-25 (Christmas)
    print("\n[Test 4] Adding Christmas Day to Holiday Calendar...")
    day_payload = {
        "holidayDate": "2026-12-25",
        "holidayName": "Christmas Day",
        "optionalHoliday": False,
        "active": True
    }
    resp_data, code = post_request(f"http://localhost:8080/api/v1/holiday-calendars/{calendar_id}/days", day_payload, auth_headers)
    if code != 201:
        print(f"Failed to add holiday day: {code} {resp_data}")
        sys.exit(1)
    print("Holiday Day added successfully.")

    # 4. Verify Weekend Rules & Holiday Exclusions (Saturday + Sunday)
    print("\n[Test 5] Verifying Weekend & Holiday Exclusions (Saturday + Sunday Policy)...")
    query_db("UPDATE organizations SET weekend_policy = 'Saturday + Sunday' WHERE id = UUID_TO_BIN(%s)", (org_id,))
    
    # Make sure we have a leave type available
    query_db("DELETE FROM leave_requests WHERE employee_id = UUID_TO_BIN(%s)", (emp_id,))
    query_db("DELETE FROM leave_balances WHERE employee_id = UUID_TO_BIN(%s)", (emp_id,))
    
    # Create a fresh leave type
    cl_payload = {
        "name": f"CL_{int(time.time())}",
        "code": f"CL_{int(time.time())}",
        "description": "Casual Leave",
        "defaultDays": 10.0,
        "carryForwardAllowed": False,
        "maxCarryForwardDays": 0.0,
        "encashmentAllowed": False,
        "halfDayAllowed": True,
        "negativeBalanceAllowed": False,
        "requiresApproval": True,
        "requiresDocument": False,
        "active": True
    }
    resp_data, _ = post_request("http://localhost:8080/api/v1/leave/types", cl_payload, auth_headers)
    leave_type_id = resp_data.get("data", {}).get("id")
    
    # Apply request: 2026-12-24 (Thurs) to 2026-12-28 (Mon)
    # Days included: Dec 24, Dec 25, Dec 26, Dec 27, Dec 28
    # Dec 25 is Christmas (Holiday), Dec 26 & 27 are weekends (Sat/Sun).
    # Actual working days should be: Dec 24 and Dec 28 (Total = 2 days)
    apply_payload = {
        "employeeId": emp_id,
        "leaveTypeId": leave_type_id,
        "startDate": "2026-12-24",
        "endDate": "2026-12-28",
        "halfDay": False,
        "reason": "Holiday exclusion test"
    }
    resp_data, code = post_request("http://localhost:8080/api/v1/leave/requests", apply_payload, auth_headers)
    if code not in [200, 201]:
        print(f"Failed to apply leave: {code} {resp_data}")
        sys.exit(1)
        
    days_count = resp_data.get("data", {}).get("daysCount")
    if days_count != 2.0:
        print(f"ERROR: Expected daysCount to be 2.0, but got {days_count}")
        sys.exit(1)
    print(f"SUCCESS: Excluded 1 holiday and 2 weekend days. Days counted: {days_count}")

    # 5. Verify Alternate Weekend Policy (Sunday Only)
    print("\n[Test 6] Verifying Alternate Weekend Policy (Sunday Only)...")
    query_db("DELETE FROM leave_requests WHERE employee_id = UUID_TO_BIN(%s)", (emp_id,))
    query_db("UPDATE organizations SET weekend_policy = 'Sunday Only' WHERE id = UUID_TO_BIN(%s)", (org_id,))
    
    # Apply request: 2026-12-26 (Saturday) to 2026-12-28 (Monday)
    # Days included: Dec 26 (Sat), Dec 27 (Sun), Dec 28 (Mon)
    # Dec 27 is Sunday (Weekend). Dec 26 is Saturday (Working day). Dec 28 is Monday (Working day).
    # Actual working days should be: Dec 26 and Dec 28 (Total = 2 days)
    apply_payload2 = {
        "employeeId": emp_id,
        "leaveTypeId": leave_type_id,
        "startDate": "2026-12-26",
        "endDate": "2026-12-28",
        "halfDay": False,
        "reason": "Sunday Only weekend policy test"
    }
    resp_data, code = post_request("http://localhost:8080/api/v1/leave/requests", apply_payload2, auth_headers)
    if code not in [200, 201]:
        print(f"Failed to apply leave: {code} {resp_data}")
        sys.exit(1)
        
    days_count2 = resp_data.get("data", {}).get("daysCount")
    if days_count2 != 2.0:
        print(f"ERROR: Expected daysCount to be 2.0, but got {days_count2}")
        sys.exit(1)
    print(f"SUCCESS: Alternate weekend policy (Sunday Only) parsed successfully. Days counted: {days_count2}")

    # 6. Policy Resolution & Wallet Auto-generation
    print("\n[Test 7] Creating Leave Policy and Rule...")
    policy_payload = {
        "policyName": "Corporate Premium Policy",
        "policyCode": f"POL_PREM_{int(time.time())}",
        "description": "Standard corporate leave policy",
        "effectiveFrom": "2026-01-01",
        "active": True
    }
    resp_data, code = post_request("http://localhost:8080/api/v1/leave-policies", policy_payload, auth_headers)
    print(f"Policy Creation Response: {code} {resp_data}")
    policy_id = resp_data.get("data", {}).get("id")
    
    # Rule: 22 days of Casual Leave
    rule_payload = {
        "leaveTypeId": leave_type_id,
        "allocatedDays": 22.0,
        "accrualMethod": "YEARLY",
        "carryForwardLimit": 5.0,
        "active": True
    }
    resp_data, code = post_request(f"http://localhost:8080/api/v1/leave-policies/{policy_id}/rules", rule_payload, auth_headers)
    print(f"Rule Creation Response: {code} {resp_data}")
    
    # Assign policy to grade '45c9c531-13c9-4fd9-aa8d-fd4bd954a86e'
    target_grade_id = "45c9c531-13c9-4fd9-aa8d-fd4bd954a86e"
    print(f"Assigning policy to Grade ID: {target_grade_id}...")
    assignment_payload = {
        "policyId": policy_id,
        "gradeId": target_grade_id
    }
    resp_data, code = post_request("http://localhost:8080/api/v1/leave-policies/assignments", assignment_payload, auth_headers)
    if code != 201:
        print(f"Failed to assign policy: {code} {resp_data}")
        sys.exit(1)
    print("Policy Assigned.")

    # Onboard a new employee with this grade ID
    print("\n[Test 8] Onboarding New Employee and Verifying Auto Wallet Generation...")
    onboard_payload = {
        "firstName": "Alice",
        "lastName": "Smith",
        "workEmail": f"alice.smith_{int(time.time())}@managemyopz.com",
        "personalEmail": f"alice_{int(time.time())}@gmail.com",
        "employeeCode": f"EMP-AS-{int(time.time()) % 100000}",
        "dateOfJoining": "2026-06-19",
        "organizationId": org_id,
        "gradeId": target_grade_id,
        "employmentStatus": "ACTIVE"
    }
    resp_data, code = post_request("http://localhost:8080/api/v1/onboarding", onboard_payload, auth_headers)
    if code != 201:
        print(f"Onboarding failed: {code} {resp_data}")
        sys.exit(1)
    
    new_emp_id = resp_data.get("data", {}).get("id")
    print(f"Onboarded Alice Smith. Employee ID: {new_emp_id}")

    # Fetch Leave Balances for Alice
    time.sleep(1) # wait 1 sec for transaction/event async processing if any, though it is synchronous
    bal_url = f"http://localhost:8080/api/v1/leave/balances/employee/{new_emp_id}?year=2026"
    resp_data, code = get_request(bal_url, auth_headers)
    balances = resp_data.get("data", [])
    
    cl_balance = next((b for b in balances if b.get("leaveTypeId") == leave_type_id), None)
    if not cl_balance:
        print("ERROR: No balance wallet found for Casual Leave!")
        sys.exit(1)
        
    allocated = cl_balance.get("totalAllocated")
    if allocated != 22.0:
        print(f"ERROR: Expected allocated balance to be 22.0 (from policy), but got {allocated}")
        sys.exit(1)
    print(f"SUCCESS: Auto Wallet Generation verified. Allocated: {allocated}")

    print("\n=== ALL PHASE 2 INTEGRATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    main()
