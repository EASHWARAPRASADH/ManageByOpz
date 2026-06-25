import urllib.request
import urllib.parse
import urllib.error
import json
import sys
import time
from datetime import datetime

# Credentials
ADMIN_EMAIL = "admin@managemyopz.com"
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
    print("=== STARTING STABILIZED LEAVE MANAGEMENT HARDEENING INTEGRATION TESTS ===")

    # 1. Login
    print("\n[Test 1] Authenticating as Admin...")
    auth_url = "http://localhost:8080/api/v1/auth/login"
    login_payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    headers = {'Content-Type': 'application/json'}
    try:
        resp_data, code = post_request(auth_url, login_payload, headers)
        if code != 200:
            print(f"Failed: Login returned status code {code}")
            sys.exit(1)
        token = resp_data.get("accessToken")
        if not token:
            print("Failed: No token found in authentication response.")
            sys.exit(1)
        print("Successfully authenticated.")
    except Exception as ex:
        print(f"Authentication failed: {ex}")
        sys.exit(1)

    auth_headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    # Fetch active employee to use
    dir_url = "http://localhost:8080/api/v1/employees"
    resp_data, _ = get_request(dir_url, auth_headers)
    employees = resp_data.get("data", [])
    if not employees:
        print("No active employees found. Please onboard an employee first.")
        sys.exit(1)
    
    employee = None
    for emp in employees:
        f_name = emp.get("firstName") or ""
        if f_name.strip() not in ["", "Unauthorized"]:
            employee = emp
            break
            
    if not employee:
        print("No valid, authorized employees found in directory.")
        sys.exit(1)
        
    emp_id = employee.get("id")
    emp_name = f"{employee.get('firstName')} {employee.get('lastName')}"
    print(f"Test Employee: {emp_name} (ID: {emp_id})")

    # Clean up existing leave requests and balances for this employee to make tests idempotent
    query_db("DELETE FROM leave_requests WHERE employee_id = UUID_TO_BIN(%s)", (emp_id,))
    query_db("DELETE FROM leave_balances WHERE employee_id = UUID_TO_BIN(%s)", (emp_id,))

    # 2. Create Leave Type (Casual Leave)
    print("\n[Test 2] Creating Leave Type: Casual Leave...")
    unique_name = f"Casual Leave {int(time.time())}"
    unique_code = f"CL_{int(time.time())}"
    cl_payload = {
        "name": unique_name,
        "code": unique_code,
        "description": "Casual personal leave",
        "defaultDays": 12.0,
        "carryForwardAllowed": True,
        "maxCarryForwardDays": 5.0,
        "encashmentAllowed": False,
        "halfDayAllowed": True,
        "negativeBalanceAllowed": False,
        "requiresApproval": True,
        "requiresDocument": False,
        "active": True
    }
    resp_data, code = post_request("http://localhost:8080/api/v1/leave/types", cl_payload, auth_headers)
    if code not in [200, 201]:
        print(f"Failed to create leave type: {resp_data}")
        sys.exit(1)
    leave_type_id = resp_data.get("data", {}).get("id")
    print(f"Created Leave Type CL. ID: {leave_type_id}")

    # 3. Apply Leave Request for 2 days
    print("\n[Test 3] Applying Leave Request...")
    apply_payload = {
        "employeeId": emp_id,
        "leaveTypeId": leave_type_id,
        "startDate": "2026-07-01",
        "endDate": "2026-07-02",
        "halfDay": False,
        "reason": "Family gathering"
    }
    resp_data, code = post_request("http://localhost:8080/api/v1/leave/requests", apply_payload, auth_headers)
    if code not in [200, 201]:
        print(f"Failed to apply leave: {resp_data}")
        sys.exit(1)
    req_id = resp_data.get("data", {}).get("id")
    status_state = resp_data.get("data", {}).get("status")
    print(f"Applied successfully. Request ID: {req_id}, Status: {status_state}")

    # Check balance arithmetic
    bal_url = f"http://localhost:8080/api/v1/leave/balances/employee/{emp_id}?year=2026"
    resp_data, _ = get_request(bal_url, auth_headers)
    balances = resp_data.get("data", [])
    cl_balance = next((b for b in balances if b.get("leaveTypeId") == leave_type_id), None)
    
    is_auto_approved = status_state in ["APPROVED", "AUTO_APPROVED"]
    expected_pending = 0.0 if is_auto_approved else 2.0
    expected_used = 2.0 if is_auto_approved else 0.0

    if not cl_balance or cl_balance.get("totalPending") != expected_pending or cl_balance.get("balance") != 10.0:
        print(f"ERROR: Balance arithmetic incorrect on apply: {cl_balance}")
        sys.exit(1)
    print(f"SUCCESS: Balance correctly updated: Pending={expected_pending}, Available=10.0")

    # 4. Approve Leave Request (only if not auto-approved)
    print("\n[Test 4] Approving Leave Request...")
    if not is_auto_approved:
        action_url = f"http://localhost:8080/api/v1/leave/requests/{req_id}/action?status=APPROVED&comment=Enjoy!"
        resp_data, code = post_request(action_url, None, auth_headers)
        if code != 200:
            print(f"Failed to approve request: {resp_data}")
            sys.exit(1)
        print(f"Approved successfully. Status: {resp_data.get('data', {}).get('status')}")
    else:
        print("Skipping approve action (request was auto-approved).")

    # Verify balance after approval
    resp_data, _ = get_request(bal_url, auth_headers)
    cl_balance = next((b for b in resp_data.get("data", []) if b.get("leaveTypeId") == leave_type_id), None)
    if not cl_balance or cl_balance.get("totalPending") != 0.0 or cl_balance.get("totalUsed") != 2.0 or cl_balance.get("balance") != 10.0:
        print(f"ERROR: Balance arithmetic incorrect post-approval: {cl_balance}")
        sys.exit(1)
    print("SUCCESS: Balance correctly updated: Pending=0.0, Used=2.0, Available=10.0")

    # 5. Reject Leave Request
    print("\n[Test 5] Rejecting Leave Request...")
    # Apply a new request
    apply_payload2 = {
        "employeeId": emp_id,
        "leaveTypeId": leave_type_id,
        "startDate": "2026-07-06",
        "endDate": "2026-07-07",
        "halfDay": False,
        "reason": "Sick leave"
    }
    resp_data, code = post_request("http://localhost:8080/api/v1/leave/requests", apply_payload2, auth_headers)
    req_id2 = resp_data.get("data", {}).get("id")
    status_state2 = resp_data.get("data", {}).get("status")
    print(f"Applied second request. Request ID: {req_id2}, Status: {status_state2}")

    is_auto_approved2 = status_state2 in ["APPROVED", "AUTO_APPROVED"]

    if not is_auto_approved2:
        # Reject second request (if pending)
        action_url2 = f"http://localhost:8080/api/v1/leave/requests/{req_id2}/action?status=REJECTED&comment=Need+coverage"
        resp_data, code = post_request(action_url2, None, auth_headers)
        if code != 200:
            print(f"Failed to reject request: {resp_data}")
            sys.exit(1)
        print(f"Rejected successfully. Status: {resp_data.get('data', {}).get('status')}")
    else:
        # Cancel second request (if auto-approved)
        cancel_url2 = f"http://localhost:8080/api/v1/leave/requests/{req_id2}/action?status=CANCELLED&comment=Cancelled+by+admin"
        resp_data, code = post_request(cancel_url2, None, auth_headers)
        if code != 200:
            print(f"Failed to cancel request: {resp_data}")
            sys.exit(1)
        print(f"Cancelled successfully. Status: {resp_data.get('data', {}).get('status')}")

    # Verify balance after rejection/cancellation (should restore back to 2.0 used)
    resp_data, _ = get_request(bal_url, auth_headers)
    cl_balance = next((b for b in resp_data.get("data", []) if b.get("leaveTypeId") == leave_type_id), None)
    if not cl_balance or cl_balance.get("totalPending") != 0.0 or cl_balance.get("totalUsed") != 2.0 or cl_balance.get("balance") != 10.0:
        print(f"ERROR: Balance arithmetic incorrect post-action: {cl_balance}")
        sys.exit(1)
    print("SUCCESS: Balance correctly restored post-rejection/cancellation.")

    # 6. Cancel Leave Request
    print("\n[Test 6] Cancelling Leave Request...")
    # Apply a third request
    apply_payload3 = {
        "employeeId": emp_id,
        "leaveTypeId": leave_type_id,
        "startDate": "2026-07-10",
        "endDate": "2026-07-11",
        "halfDay": False,
        "reason": "Doc checkup"
    }
    resp_data, code = post_request("http://localhost:8080/api/v1/leave/requests", apply_payload3, auth_headers)
    req_id3 = resp_data.get("data", {}).get("id")
    status_state3 = resp_data.get("data", {}).get("status")
    
    is_auto_approved3 = status_state3 in ["APPROVED", "AUTO_APPROVED"]
    if not is_auto_approved3:
        # Approve first
        action_url3 = f"http://localhost:8080/api/v1/leave/requests/{req_id3}/action?status=APPROVED&comment=Approved"
        post_request(action_url3, None, auth_headers)

    # Cancel approved request
    cancel_url = f"http://localhost:8080/api/v1/leave/requests/{req_id3}/action?status=CANCELLED&comment=Cancelled+by+employee"
    resp_data, code = post_request(cancel_url, None, auth_headers)
    if code != 200:
        print(f"Failed to cancel request: {resp_data}")
        sys.exit(1)
    print(f"Cancelled successfully. Status: {resp_data.get('data', {}).get('status')}")

    # Verify balance after cancellation
    resp_data, _ = get_request(bal_url, auth_headers)
    cl_balance = next((b for b in resp_data.get("data", []) if b.get("leaveTypeId") == leave_type_id), None)
    if not cl_balance or cl_balance.get("totalPending") != 0.0 or cl_balance.get("totalUsed") != 2.0 or cl_balance.get("balance") != 10.0:
        print(f"ERROR: Balance arithmetic incorrect post-cancellation: {cl_balance}")
        sys.exit(1)
    print("SUCCESS: Balance correctly restored post-cancellation.")

    # 7. Overlap Validation
    print("\n[Test 7] Testing Overlap Validation...")
    overlap_payload = {
        "employeeId": emp_id,
        "leaveTypeId": leave_type_id,
        "startDate": "2026-07-02",
        "endDate": "2026-07-03",
        "halfDay": False,
        "reason": "Overlap attempt"
    }
    resp_data, code = post_request("http://localhost:8080/api/v1/leave/requests", overlap_payload, auth_headers)
    if code != 409:
        print(f"ERROR: Expected HTTP 409 Conflict for overlap, got {code} {resp_data}")
        sys.exit(1)
    if resp_data.get("errorCode") != "LEAVE_OVERLAP":
        print(f"ERROR: Expected errorCode 'LEAVE_OVERLAP', got '{resp_data.get('errorCode')}'")
        sys.exit(1)
    print(f"SUCCESS: Server correctly rejected overlap with 409 Conflict and errorCode 'LEAVE_OVERLAP'. Message: {resp_data.get('message')}")

    # 8. Insufficient Balance Validation
    print("\n[Test 8] Testing Insufficient Balance Validation...")
    overlimit_payload = {
        "employeeId": emp_id,
        "leaveTypeId": leave_type_id,
        "startDate": "2026-07-15",
        "endDate": "2026-07-29",
        "halfDay": False,
        "reason": "Over limit attempt"
    }
    resp_data, code = post_request("http://localhost:8080/api/v1/leave/requests", overlimit_payload, auth_headers)
    if code != 409:
        print(f"ERROR: Expected HTTP 409 Conflict for insufficient balance, got {code} {resp_data}")
        sys.exit(1)
    if resp_data.get("errorCode") != "INSUFFICIENT_BALANCE":
        print(f"ERROR: Expected errorCode 'INSUFFICIENT_BALANCE', got '{resp_data.get('errorCode')}'")
        sys.exit(1)
    errors = resp_data.get("errors", {})
    if "availableBalance" not in errors or "requestedDays" not in errors:
        print(f"ERROR: Missing details in errors payload: {errors}")
        sys.exit(1)
    print(f"SUCCESS: Server correctly rejected insufficient balance with 409 Conflict and errorCode 'INSUFFICIENT_BALANCE'. details: {errors}")

    # 9. Negative Balance Validation
    print("\n[Test 9] Testing Negative Balance Policy Override...")
    neg_code = f"NEG_{int(time.time())}"
    neg_name = f"Negative Allowed Leave {int(time.time())}"
    neg_payload = {
        "name": neg_name,
        "code": neg_code,
        "description": "Negative balance allowed leave",
        "defaultDays": 5.0,
        "carryForwardAllowed": False,
        "maxCarryForwardDays": 0.0,
        "encashmentAllowed": False,
        "halfDayAllowed": True,
        "negativeBalanceAllowed": True,
        "requiresApproval": True,
        "requiresDocument": False,
        "active": True
    }
    resp_data, code = post_request("http://localhost:8080/api/v1/leave/types", neg_payload, auth_headers)
    neg_leave_type_id = resp_data.get("data", {}).get("id")
    
    neg_apply_payload = {
        "employeeId": emp_id,
        "leaveTypeId": neg_leave_type_id,
        "startDate": "2026-08-01",
        "endDate": "2026-08-08",
        "halfDay": False,
        "reason": "Exceeding default but allowed"
    }
    resp_data, code = post_request("http://localhost:8080/api/v1/leave/requests", neg_apply_payload, auth_headers)
    if code not in [200, 201]:
        print(f"ERROR: Expected successful submit for negative-allowed leave type, got status {code} {resp_data}")
        sys.exit(1)
    print(f"SUCCESS: Negative balance request submitted successfully. Status: {resp_data.get('data', {}).get('status')}")

    # 10. Audit Log Verification
    print("\n[Test 10] Testing Audit Log Verification...")
    logs = query_db("SELECT * FROM audit_log WHERE module_code = 'LEAVE' ORDER BY performed_at DESC LIMIT 5")
    if not logs:
        print("ERROR: No audit logs found in database!")
        sys.exit(1)
    print("SUCCESS: Found audit log records:")
    for log_row in logs:
        print(f" - performed_at: {log_row['performed_at']} | entity_type: {log_row['entity_type']} | action: {log_row['action']}")

    # 11. Transaction Rollback Verification
    print("\n[Test 11] Testing Transaction Rollback Verification...")
    resp_data, _ = get_request(bal_url, auth_headers)
    before_bal = next((b for b in resp_data.get("data", []) if b.get("leaveTypeId") == leave_type_id), None)
    
    # Overlapping request fails validation
    post_request("http://localhost:8080/api/v1/leave/requests", overlap_payload, auth_headers)
    
    # Balance must remain exactly identical
    resp_data, _ = get_request(bal_url, auth_headers)
    after_bal = next((b for b in resp_data.get("data", []) if b.get("leaveTypeId") == leave_type_id), None)
    
    if before_bal.get("totalPending") != after_bal.get("totalPending") or before_bal.get("balance") != after_bal.get("balance"):
        print(f"ERROR: Transaction rollback failed! Balance mutated despite request rejection. Before: {before_bal}, After: {after_bal}")
        sys.exit(1)
    print("SUCCESS: Transaction rolled back successfully; balance remains unchanged.")

    # 12. Concurrent/Sequential Rapid Requests
    print("\n[Test 12] Testing Rapid Concurrent/Sequential Leave Requests...")
    rapid1 = {
        "employeeId": emp_id,
        "leaveTypeId": leave_type_id,
        "startDate": "2026-09-01",
        "endDate": "2026-09-02",
        "halfDay": False,
        "reason": "Rapid 1"
    }
    resp1, code1 = post_request("http://localhost:8080/api/v1/leave/requests", rapid1, auth_headers)
    
    rapid2 = {
        "employeeId": emp_id,
        "leaveTypeId": leave_type_id,
        "startDate": "2026-09-02",
        "endDate": "2026-09-03",
        "halfDay": False,
        "reason": "Rapid 2"
    }
    resp2, code2 = post_request("http://localhost:8080/api/v1/leave/requests", rapid2, auth_headers)
    
    if code1 not in [200, 201] or code2 != 409:
        print(f"ERROR: Rapid overlap detection failed. Code1: {code1}, Code2: {code2}")
        sys.exit(1)
    print("SUCCESS: First rapid request approved/submitted, second rejected due to overlap.")

    print("\n=== ALL 12 INTEGRATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    main()
