import urllib.request
import urllib.parse
import json
import time

BASE_URL = "http://localhost:8080/api/v1"

def make_request(url, method="GET", headers=None, data=None):
    if headers is None:
        headers = {}
    
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode("utf-8")
            return status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, body
    except Exception as e:
        return 500, str(e)

def test_rbac():
    print("=== Testing Security & RBAC APIs (Using urllib) ===")
    ts = int(time.time())

    # 1. Generate token for Admin
    print("\n1. Generating Admin JWT token...")
    payload = {
        "username": f"admin-test-{ts}",
        "tenantId": "default",
        "role": "ROLE_ADMIN",
        "employeeId": ""
    }
    status, res = make_request(f"{BASE_URL}/security/auth/token", "POST", data=payload)
    print("Response Status:", status)
    token_data = res["data"]
    admin_token = token_data["token"]
    print("Generated token:", admin_token[:30] + "...")

    # 2. List Roles
    print("\n2. Listing roles using Admin token...")
    headers = {"Authorization": f"Bearer {admin_token}"}
    status, res = make_request(f"{BASE_URL}/security/roles", "GET", headers=headers)
    print("Response Status:", status)
    roles = res["data"]
    for role in roles:
        print(f"Role: {role['name']} (Code: {role['code']}, Priority: {role['priority']})")

    # 3. Create a User using Admin token
    print("\n3. Creating User using Admin token...")
    user_payload = {
        "username": f"superadmin-{ts}",
        "email": f"superadmin-{ts}@managemyopz.com",
        "firstName": "Super",
        "lastName": "Admin",
        "password": "Password123!",
        "roleCodes": ["ROLE_SUPER_ADMIN"]
    }
    status, res = make_request(f"{BASE_URL}/security/users", "POST", headers=headers, data=user_payload)
    print("Response Status:", status)
    user_data = res["data"]
    user_id = user_data["id"]
    print(f"Created User: {user_data['username']} (ID: {user_id})")

    # 4. Generate token for Employee (Low privilege)
    print("\n4. Generating Employee JWT token...")
    emp_payload = {
        "username": f"emp-test-{ts}",
        "tenantId": "default",
        "role": "ROLE_EMPLOYEE",
        "employeeId": ""
    }
    status, res = make_request(f"{BASE_URL}/security/auth/token", "POST", data=emp_payload)
    emp_token = res["data"]["token"]
    emp_headers = {"Authorization": f"Bearer {emp_token}"}

    # 5. Try to Create an Employee Twin using Employee Token (Should fail - 403 Forbidden)
    print("\n5. Testing CREATE Employee Twin authorization using Employee Token...")
    twin_payload = {
        "employeeCode": f"EMP{ts % 1000000}",
        "firstName": "Unauthorized",
        "lastName": "User",
        "workEmail": f"unauth-{ts}@managemyopz.com",
        "employmentStatus": "ACTIVE",
        "organizationId": "36bf4b42-eab9-4a95-ab0a-bad239026ed0"
    }
    status, res = make_request(f"{BASE_URL}/employees", "POST", headers=emp_headers, data=twin_payload)
    print("Response Status (Expected 403):", status)
    
    # 6. Create Employee Twin using Admin Token (Should succeed - 201 Created)
    print("\n6. Testing CREATE Employee Twin authorization using Admin Token...")
    status, res = make_request(f"{BASE_URL}/employees", "POST", headers=headers, data=twin_payload)
    print("Response Status (Expected 201):", status)
    created_twin = res["data"]
    twin_id = created_twin["id"]
    print(f"Created Employee Twin ID: {twin_id}")

    # 7. Try to Terminate using Admin Token (Should fail - 403 Forbidden, since only ROLE_SUPER_ADMIN+ can terminate)
    print("\n7. Testing TERMINATE Employee Twin authorization using Admin Token...")
    status, res = make_request(f"{BASE_URL}/employees/{twin_id}/terminate?exitDate=2026-06-30&reason=Resignation", "POST", headers=headers)
    print("Response Status (Expected 403):", status)

    # 8. Generate token for Super Admin
    print("\n8. Generating Super Admin JWT token...")
    sa_payload = {
        "username": f"sa-test-{ts}",
        "tenantId": "default",
        "role": "ROLE_SUPER_ADMIN",
        "employeeId": ""
    }
    status, res = make_request(f"{BASE_URL}/security/auth/token", "POST", data=sa_payload)
    sa_token = res["data"]["token"]
    sa_headers = {"Authorization": f"Bearer {sa_token}"}

    # 9. Terminate using Super Admin Token (Should succeed)
    print("\n9. Testing TERMINATE Employee Twin authorization using Super Admin Token...")
    status, res = make_request(f"{BASE_URL}/employees/{twin_id}/terminate?exitDate=2026-06-30&reason=Resignation", "POST", headers=sa_headers)
    print("Response Status (Expected 200/201):", status)
    print("Response Body:", res)

    print("\n=== RBAC Verification Complete ===")

if __name__ == "__main__":
    test_rbac()
