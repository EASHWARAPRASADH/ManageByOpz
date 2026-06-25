import urllib.request
import urllib.error
import json
import sys

def get_admin_token():
    print("Authenticating as Admin...")
    login_data = json.dumps({
        "email": "ultra.admin@managemyopz.com",
        "password": "Admin@123"
    }).encode('utf-8')
    
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/auth/login",
        data=login_data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    with urllib.request.urlopen(req, timeout=10) as resp:
        resp_data = json.loads(resp.read().decode('utf-8'))
        return resp_data.get("accessToken")

def make_request(url, method='GET', data=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    encoded_data = json.dumps(data).encode('utf-8') if data else None
    
    req = urllib.request.Request(
        url,
        data=encoded_data,
        headers=headers,
        method=method
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as err:
        return err.code, json.loads(err.read().decode('utf-8'))

def test_lifecycle():
    token = get_admin_token()
    print("Token retrieved successfully.")

    # Fetch Organizations
    status, org_resp = make_request("http://localhost:8080/api/v1/org-dna/organizations", token=token)
    assert status == 200, f"Expected 200, got {status}"
    org_id = org_resp["data"][0]["id"]
    print(f"Using Organization ID: {org_id}")

    # Fetch Business Units
    status, bu_resp = make_request(f"http://localhost:8080/api/v1/org-dna/organizations/{org_id}/business-units", token=token)
    assert status == 200
    bu_id = bu_resp["data"][0]["id"]
    print(f"Using Business Unit ID: {bu_id}")

    # Step 1: Attempt to create a duplicate division (case-insensitive check)
    # Let's create a division first
    div_payload_1 = {
        "name": "Validation Test Division",
        "code": "VAL_TEST_DIV",
        "description": "Validation testing"
    }
    print("\n[Test 1] Creating division 1...")
    status, res1 = make_request(f"http://localhost:8080/api/v1/org-dna/business-units/{bu_id}/divisions", method='POST', data=div_payload_1, token=token)
    if status == 201:
        print("Division 1 created successfully.")
        div_id = res1["data"]["id"]
    elif status == 409 and res1.get("errorCode") == "DUPLICATE_CODE":
        print("Division 1 already exists. Fetching existing...")
        status, divs_resp = make_request(f"http://localhost:8080/api/v1/org-dna/business-units/{bu_id}/divisions", token=token)
        div_id = [d["id"] for d in divs_resp["data"] if d["code"].upper() == "VAL_TEST_DIV"][0]
    else:
        print(f"Failed to setup division 1: {status} - {res1}")
        sys.exit(1)

    # Now create another division with the same name but different casing
    div_payload_dup_name = {
        "name": "validation test division",
        "code": "VAL_TEST_DIV_DIFF",
        "description": "Validation testing duplicate name"
    }
    print("[Test 2] Creating duplicate name division (lowercase)...")
    status, res_dup_name = make_request(f"http://localhost:8080/api/v1/org-dna/business-units/{bu_id}/divisions", method='POST', data=div_payload_dup_name, token=token)
    print(f"Response: {status} - {res_dup_name}")
    assert status == 409, f"Expected 409, got {status}"
    assert res_dup_name.get("errorCode") == "DUPLICATE_CODE", f"Expected DUPLICATE_CODE error code"
    print("Duplicate name validation works correctly (case-insensitive)!")

    # Create another division with the same code but different casing
    div_payload_dup_code = {
        "name": "Validation Test Division Unique",
        "code": "val_test_div",
        "description": "Validation testing duplicate code"
    }
    print("[Test 3] Creating duplicate code division (lowercase)...")
    status, res_dup_code = make_request(f"http://localhost:8080/api/v1/org-dna/business-units/{bu_id}/divisions", method='POST', data=div_payload_dup_code, token=token)
    print(f"Response: {status} - {res_dup_code}")
    assert status == 409, f"Expected 409, got {status}"
    assert res_dup_code.get("errorCode") == "DUPLICATE_CODE", f"Expected DUPLICATE_CODE error code"
    print("Duplicate code validation works correctly (case-insensitive)!")

    # Step 2: Dependency Protection validation
    # Let's create a department under the division
    dept_payload = {
        "name": "Dependency Test Dept",
        "code": "DEP_TEST_DEPT"
    }
    print("\n[Test 4] Creating department under division...")
    status, dept_res = make_request(f"http://localhost:8080/api/v1/org-dna/divisions/{div_id}/departments", method='POST', data=dept_payload, token=token)
    assert status == 201, f"Expected 201, got {status}"
    dept_id = dept_res["data"]["id"]
    print("Department created successfully.")

    # Attempt to delete the division (should fail since it has a child department)
    print("[Test 5] Attempting to delete division containing departments...")
    status, del_div_res = make_request(f"http://localhost:8080/api/v1/org-dna/divisions/{div_id}", method='DELETE', token=token)
    print(f"Response: {status} - {del_div_res}")
    assert status == 409, f"Expected 409 Conflict, got {status}"
    assert del_div_res.get("errorCode") == "NODE_IN_USE", f"Expected NODE_IN_USE, got {del_div_res.get('errorCode')}"
    print("Dependency protection blocked deletion successfully!")

    # Step 3: Lifecycle Management Soft-Delete (Archive) & Restore
    # Delete the department first
    print("\n[Test 6] Deleting department...")
    status, del_dept_res = make_request(f"http://localhost:8080/api/v1/org-dna/departments/{dept_id}", method='DELETE', token=token)
    assert status == 200, f"Expected 200, got {status}"
    print("Department archived successfully.")

    # Now delete the division (should succeed now)
    print("[Test 7] Deleting division...")
    status, del_div_res = make_request(f"http://localhost:8080/api/v1/org-dna/divisions/{div_id}", method='DELETE', token=token)
    assert status == 200, f"Expected 200, got {status}"
    print("Division archived successfully.")

    # Verify that the division is soft-deleted (deleted=true)
    status, divs_resp = make_request(f"http://localhost:8080/api/v1/org-dna/business-units/{bu_id}/divisions?includeDeleted=true", token=token)
    deleted_div = [d for d in divs_resp["data"] if d["id"] == div_id][0]
    assert deleted_div["deleted"] is True, "Expected deleted to be True"
    print("Soft-delete flag successfully verified (deleted=true)!")

    # Restore the division
    print("[Test 8] Restoring division...")
    status, restore_res = make_request(f"http://localhost:8080/api/v1/org-dna/divisions/{div_id}/restore", method='POST', token=token)
    assert status == 200, f"Expected 200, got {status}"
    print("Division restored successfully.")

    # Verify that the division is restored (deleted=false)
    status, divs_resp_2 = make_request(f"http://localhost:8080/api/v1/org-dna/business-units/{bu_id}/divisions", token=token)
    restored_div = [d for d in divs_resp_2["data"] if d["id"] == div_id][0]
    assert restored_div["deleted"] is False, "Expected deleted to be False"
    print("Restore flag successfully verified (deleted=false)!")

    # Cleanup: Delete them again so as not to clutter the DB
    print("\n[Cleanup] Archiving test division and department again...")
    make_request(f"http://localhost:8080/api/v1/org-dna/departments/{dept_id}", method='DELETE', token=token)
    make_request(f"http://localhost:8080/api/v1/org-dna/divisions/{div_id}", method='DELETE', token=token)
    print("Cleanup completed.")

    print("\n=== ALL VALIDATION AND LIFECYCLE TESTS PASSED ===")

if __name__ == "__main__":
    test_lifecycle()
