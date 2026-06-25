import urllib.request
import urllib.error
import json
import sys

def post_request(url, payload, token):
    payload_bytes = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=payload_bytes,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        },
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            return resp.status, resp_data
    except urllib.error.HTTPError as err:
        try:
            err_data = json.loads(err.read().decode('utf-8'))
        except Exception:
            err_data = err.reason
        return err.code, err_data
    except Exception as ex:
        return 0, str(ex)

def run_test():
    print("=== STARTING DUPLICATE ONBOARDING TEST ===")
    
    # 1. Authenticate as Admin
    print("\n[Step 1] Authenticating as Admin...")
    login_data = json.dumps({
        "email": "admin@managemyopz.com",
        "password": "Admin@123"
    }).encode('utf-8')
    
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/auth/login",
        data=login_data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    token = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            token = resp_data.get("accessToken")
            print("Successfully authenticated.")
    except Exception as ex:
        print(f"Auth request failed: {ex}")
        sys.exit(1)
        
    if not token:
        print("Failed to retrieve token.")
        sys.exit(1)

    # 2. Test Idempotency / Cleanup for dhipak@gmail.com
    print("\n[Step 2] Testing onboarding for 'dhipak@gmail.com' (First attempt)...")
    payload1 = {
        "firstName": "Dhipak",
        "lastName": "Developer",
        "workEmail": "dhipak@gmail.com",
        "personalEmail": "dhipak.personal@gmail.com",
        "phone": "9876543220",
        "emergencyPhone": "9876543221",
        "gender": "MALE",
        "dateOfBirth": "1995-08-20",
        "organizationId": "6841af62-9c16-431b-a8c2-a3adba1dc47a",
        "dateOfJoining": "2026-07-01",
        "department": "Engineering",
        "designation": "Lead Engineer",
        "location": "Chennai",
        "workMode": "OFFICE",
        "employmentStatus": "ACTIVE"
    }
    
    status, data = post_request("http://localhost:8080/api/v1/onboarding", payload1, token)
    print(f"First Onboarding Status: {status}")
    if status != 201:
        print(f"Failed to onboard first time: {data}")
        sys.exit(1)
    
    print("\n[Step 3] Testing onboarding for 'dhipak@gmail.com' again (Second attempt - should trigger cleanup and succeed)...")
    status, data = post_request("http://localhost:8080/api/v1/onboarding", payload1, token)
    print(f"Second Onboarding Status: {status}")
    if status != 201:
        print(f"Cleanup / Idempotency failed: {data}")
        sys.exit(1)
    print("SUCCESS: Second onboarding for dhipak@gmail.com succeeded!")

    # 3. Test 409 Conflict validation for other duplicates
    print("\n[Step 4] Testing onboarding for duplicate other email (First attempt)...")
    payload2 = {
        "firstName": "John",
        "lastName": "Doe",
        "workEmail": "john.duplicate@managemyopz.com",
        "personalEmail": "john.duplicate.personal@gmail.com",
        "phone": "9876543320",
        "emergencyPhone": "9876543321",
        "gender": "MALE",
        "dateOfBirth": "1990-01-01",
        "organizationId": "6841af62-9c16-431b-a8c2-a3adba1dc47a",
        "dateOfJoining": "2026-07-01",
        "department": "Engineering",
        "designation": "Senior Engineer",
        "location": "New York",
        "workMode": "REMOTE",
        "employmentStatus": "ACTIVE"
    }
    
    status, data = post_request("http://localhost:8080/api/v1/onboarding", payload2, token)
    print(f"First Attempt Status: {status}")
    if status != 201:
        print(f"Failed to onboard John Doe first time: {data}")
        sys.exit(1)
        
    print("\n[Step 5] Testing onboarding for duplicate other email again (Second attempt - should fail with 409 Conflict)...")
    status, data = post_request("http://localhost:8080/api/v1/onboarding", payload2, token)
    print(f"Second Attempt Status: {status}")
    print(f"Response Data: {data}")
    if status != 409:
        print(f"Failed: Expected 409 Conflict status but got {status}")
        sys.exit(1)
    
    # Check details of error response
    if not data.get("success") is False:
        print("Failed: Expected success field to be False")
        sys.exit(1)
    if data.get("errorCode") != "DUPLICATE_WORK_EMAIL" and data.get("errorCode") != "DUPLICATE_USER_EMAIL":
        print(f"Failed: Unexpected error code {data.get('errorCode')}")
        sys.exit(1)
        
    print("\n=== ALL DUPLICATE ONBOARDING TEST CHECKS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_test()
