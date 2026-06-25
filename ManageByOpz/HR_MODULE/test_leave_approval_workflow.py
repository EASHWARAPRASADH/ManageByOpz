import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:8080/api"

def make_request(url, method="GET", payload=None, headers=None):
    if headers is None:
        headers = {}
    
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            res_data = res.read().decode("utf-8")
            if res_data:
                return res.status, json.loads(res_data)
            return res.status, None
    except urllib.error.HTTPError as e:
        err_data = e.read().decode("utf-8")
        print(f"HTTP Error {e.code}: {err_data}")
        raise Exception(f"HTTP Request failed with status {e.code}: {err_data}")

def login(email, password):
    url = f"{BASE_URL}/v1/auth/login"
    payload = {"email": email, "password": password}
    status, data = make_request(url, method="POST", payload=payload)
    if status == 200:
        return data["accessToken"], data["user"]
    else:
        raise Exception(f"Login failed: {data}")

EMPLOYEE_TWIN_IDS = {
    "robert.johnson@acme.com": "b0000000-0000-0000-0000-000000000001",
    "michael.chen@acme.com": "b0000000-0000-0000-0000-000000000002",
    "sarah.williams@acme.com": "b0000000-0000-0000-0000-000000000003",
    "dhipak.sankar@acme.com": "b0000000-0000-0000-0000-000000000004",
    "arpit.sharma@acme.com": "b0000000-0000-0000-0000-000000000005",
    "priya.nair@acme.com": "b0000000-0000-0000-0000-000000000006",
    "rahul.gupta@acme.com": "b0000000-0000-0000-0000-000000000007"
}

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

def test_workflow():
    print("=== STARTING LEAVE APPROVAL WORKFLOW INTEGRATION TEST ===")
    
    emp_twin_id = "b0000000-0000-0000-0000-000000000004"
    # Clean up existing leave requests and reset balances for this employee to make tests idempotent
    query_db("DELETE FROM leave_requests WHERE employee_id = UUID_TO_BIN(%s)", (emp_twin_id,))
    query_db("UPDATE leave_balances SET balance = 12.0, total_used = 0.0, total_pending = 0.0 WHERE employee_id = UUID_TO_BIN(%s) AND leave_type_id = UNHEX('c0000000000000000000000000000001')", (emp_twin_id,))
    
    # 1. Login as Dhipak Sankar (Employee)
    print("\n1. Logging in as employee (Dhipak Sankar)...")
    token_emp, user_emp = login("dhipak.sankar@acme.com", "Admin@123")
    emp_twin_id = EMPLOYEE_TWIN_IDS[user_emp['email']]
    print(f"Logged in successfully. User email: {user_emp['email']}, Employee ID: {emp_twin_id}, Tenant: {user_emp['tenantId']}")
    
    headers_emp = {
        "Authorization": f"Bearer {token_emp}",
        "X-Tenant-ID": "ACME"
    }
    
    # 2. Get Dhipak's Leave Balances before request
    print("\n2. Fetching Dhipak's leave balances before request...")
    url_bal = f"{BASE_URL}/v1/leave/balances/employee/{emp_twin_id}?year=2026"
    status, res_bal = make_request(url_bal, headers=headers_emp)
    balances_before = res_bal["data"]
    cl_balance_before = next(b for b in balances_before if b["leaveTypeId"] == "c0000000-0000-0000-0000-000000000001")
    print(f"Current CL Balance: {cl_balance_before['balance']} / {cl_balance_before['totalAllocated']}")
    
    # 3. Submit Leave Request (3 days: 2026-07-01 to 2026-07-03)
    print("\n3. Submitting leave request for 3 days of Casual Leave (CL)...")
    payload_leave = {
        "employeeId": emp_twin_id,
        "leaveTypeId": cl_balance_before["leaveTypeId"],
        "startDate": "2026-07-01",
        "endDate": "2026-07-03",
        "daysCount": 3.0,
        "halfDay": False,
        "reason": "Test approval matrix engine integration"
    }
    url_req = f"{BASE_URL}/v1/leave/requests"
    status, res_req = make_request(url_req, method="POST", payload=payload_leave, headers=headers_emp)
    if status != 201:
        raise Exception(f"Failed to submit leave request: {res_req}")
    
    leave_request = res_req["data"]
    req_id = leave_request["id"]
    print(f"Leave request created. ID: {req_id}, Status: {leave_request['status']}")
    
    # 4. Login as Sarah Williams (Level 1 Approver)
    print("\n4. Logging in as Level 1 Approver (Sarah Williams)...")
    token_l1, user_l1 = login("sarah.williams@acme.com", "Admin@123")
    print(f"Logged in successfully. User email: {user_l1['email']}")
    
    headers_l1 = {
        "Authorization": f"Bearer {token_l1}",
        "X-Tenant-ID": "ACME"
    }
    
    # 5. Fetch Pending Approvals for Sarah
    print("\n5. Checking pending approvals for Sarah Williams...")
    url_pending = f"{BASE_URL}/v1/workflow/pending"
    status, res_pending = make_request(url_pending, headers=headers_l1)
    pending_l1 = res_pending["data"]
    
    matching_pending_l1 = [p for p in pending_l1 if p["entityId"] == req_id]
    if not matching_pending_l1:
        raise Exception(f"Leave request {req_id} NOT found in Sarah Williams' pending approvals!")
    
    workflow_instance = matching_pending_l1[0]
    print(f"Found pending task. Instance ID: {workflow_instance['id']}, Current Step Order: {workflow_instance['currentStepOrder']}")
    
    # 6. Approve as Sarah Williams
    print("\n6. Approving leave request as Sarah Williams...")
    payload_action = {
        "entityType": "LEAVE",
        "entityId": req_id,
        "action": "APPROVED",
        "comments": "Approved at Level 1"
    }
    url_action = f"{BASE_URL}/v1/workflow/action"
    status, res_action = make_request(url_action, method="POST", payload=payload_action, headers=headers_l1)
    if status != 200:
        raise Exception(f"Sarah's approval failed: {res_action}")
    print("Level 1 approval processed successfully.")
    
    # 7. Login as Michael Chen (Level 2 Approver)
    print("\n7. Logging in as Level 2 Approver (Michael Chen)...")
    token_l2, user_l2 = login("michael.chen@acme.com", "Admin@123")
    print(f"Logged in successfully. User email: {user_l2['email']}")
    
    headers_l2 = {
        "Authorization": f"Bearer {token_l2}",
        "X-Tenant-ID": "ACME"
    }
    
    # 8. Fetch Pending Approvals for Michael Chen
    print("\n8. Checking pending approvals for Michael Chen...")
    status, res_pending_l2 = make_request(url_pending, headers=headers_l2)
    pending_l2 = res_pending_l2["data"]
    
    matching_pending_l2 = [p for p in pending_l2 if p["entityId"] == req_id]
    if not matching_pending_l2:
        raise Exception(f"Leave request {req_id} NOT found in Michael Chen's pending approvals!")
    
    workflow_instance_l2 = matching_pending_l2[0]
    print(f"Found pending task. Instance ID: {workflow_instance_l2['id']}, Current Step Order: {workflow_instance_l2['currentStepOrder']}")
    
    # 9. Approve as Michael Chen
    print("\n9. Approving leave request as Michael Chen...")
    payload_action["comments"] = "Approved at Level 2 (Final)"
    status, res_action_l2 = make_request(url_action, method="POST", payload=payload_action, headers=headers_l2)
    if status != 200:
        raise Exception(f"Michael's approval failed: {res_action_l2}")
    print("Level 2 (final) approval processed successfully.")
    
    # 10. Verify final leave request status and balance adjustment
    print("\n10. Verifying final state...")
    url_get_req = f"{BASE_URL}/v1/leave/requests/employee/{emp_twin_id}"
    status, res_all_reqs = make_request(url_get_req, headers=headers_emp)
    all_requests = res_all_reqs["data"]
    final_req = next(r for r in all_requests if r["id"] == req_id)
    print(f"Final Leave Request Status: {final_req['status']}")
    if final_req["status"] != "APPROVED":
        raise Exception(f"Leave request status is {final_req['status']}, expected APPROVED!")
        
    status, res_bal_after = make_request(url_bal, headers=headers_emp)
    balances_after = res_bal_after["data"]
    cl_balance_after = next(b for b in balances_after if b["leaveTypeId"] == "c0000000-0000-0000-0000-000000000001")
    print(f"CL Balance after approval: {cl_balance_after['balance']} (reduced by 3.0 from {cl_balance_before['balance']})")
    
    if cl_balance_after["balance"] != cl_balance_before["balance"] - 3.0:
         raise Exception(f"Leave balance was not correctly deducted! Expected {cl_balance_before['balance'] - 3.0}, got {cl_balance_after['balance']}")
         
    print("\n[SUCCESS] End-to-end leave approval workflow successfully validated!")

if __name__ == "__main__":
    try:
        test_workflow()
    except Exception as e:
        import traceback
        traceback.print_exc()
