import urllib.request
import urllib.error
import json
import sys
import random

def run_tests():
    print("=== STARTING ADMINISTRATIVE USER SECURITY CONTROLLER INTEGRATION TEST ===")
    
    # 1. Authenticate as Admin to retrieve JWT Token
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
            print("Admin successfully authenticated.")
    except Exception as ex:
        print(f"Auth request failed: {ex}")
        sys.exit(1)

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}',
        'X-Tenant-Id': 'ACME'
    }

    # 2. Onboard a temporary employee to get a fresh employee and user account
    print("\n[Step 2] Provisioning new employee twin...")
    emp_suffix = str(random.randint(1000, 9999))
    work_email = f"sec.test.{emp_suffix}@managemyopz.com"
    onboarding_payload = {
        "firstName": "Security",
        "lastName": f"Tester-{emp_suffix}",
        "workEmail": work_email,
        "personalEmail": f"sec.test.personal.{emp_suffix}@gmail.com",
        "phone": "9998887770",
        "emergencyPhone": "9998887771",
        "gender": "FEMALE",
        "dateOfBirth": "1994-08-22",
        "organizationId": "6841af62-9c16-431b-a8c2-a3adba1dc47a",
        "businessUnitId": "34914c62-8176-432a-bc91-23a5ba1dc411",
        "divisionId": "91234c62-8176-432a-bc91-23a5ba1dc422",
        "departmentId": "4861af62-9c16-431b-a8c2-a3adba1dc47b",
        "designationId": "51234c62-8176-432a-bc91-23a5ba1dc433",
        "locationId": "7861af62-9c16-431b-a8c2-a3adba1dc47c",
        "gradeId": "11234c62-8176-432a-bc91-23a5ba1dc444",
        "employmentTypeId": "21234c62-8176-432a-bc91-23a5ba1dc455",
        "dateOfJoining": "2026-06-19",
        "employmentStatus": "ACTIVE",
        "currentAddress": "Security Test Suite Blvd",
        "permanentAddress": "Security Test Suite Blvd",
        "panNumber": f"ABCDE{random.randint(1000,9999)}F",
        "aadhaarNumber": f"{random.randint(1000,9999)}{random.randint(1000,9999)}{random.randint(1000,9999)}",
        "bankName": "Security Sandbox Bank",
        "bankAccountNumber": f"{random.randint(100000000,999999999)}",
        "bankIfsc": "SECU0000001",
        "bankBranch": "QA Head Office"
    }

    req = urllib.request.Request(
        "http://localhost:8080/api/v1/onboarding",
        data=json.dumps(onboarding_payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    
    employee_id = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            employee_id = resp_data.get("data", {}).get("id")
            print(f"Employee successfully onboarded. ID: {employee_id}")
    except Exception as ex:
        print(f"Onboarding failed: {ex}")
        sys.exit(1)

    # 3. Retrieve User Account via Employee ID
    print("\n[Step 3] Querying user account details...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/employees/{employee_id}/account",
        headers=headers,
        method='GET'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            account = json.loads(resp.read().decode('utf-8')).get("data")
            print("Successfully retrieved user account details:")
            print(f"  Username: {account.get('username')}")
            print(f"  Status: {account.get('status')}")
            print(f"  MFA Enabled: {account.get('mfaEnabled')}")
            print(f"  Password Change Required: {account.get('passwordChangeRequired')}")
            assert account.get('status') == "PENDING_ACTIVATION"
    except Exception as ex:
        print(f"Failed to retrieve account: {ex}")
        sys.exit(1)

    # 4. Disable Account
    print("\n[Step 4] Disabling the user account...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/employees/{employee_id}/account/disable",
        data=b'',
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print("Disable API Call: SUCCESS")
    except Exception as ex:
        print(f"Disable API Call failed: {ex}")
        sys.exit(1)

    # Verify status is DISABLED
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/employees/{employee_id}/account",
        headers=headers,
        method='GET'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            account = json.loads(resp.read().decode('utf-8')).get("data")
            print(f"  Updated Status: {account.get('status')}")
            assert account.get('status') == "DISABLED"
    except Exception as ex:
        print(f"Verification of status failed: {ex}")
        sys.exit(1)

    # 5. Enable/Re-activate Account
    print("\n[Step 5] Re-enabling the user account...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/employees/{employee_id}/account/enable",
        data=b'',
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print("Enable API Call: SUCCESS")
    except Exception as ex:
        print(f"Enable API Call failed: {ex}")
        sys.exit(1)

    # Verify status is ACTIVE (since enabling is reactivating)
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/employees/{employee_id}/account",
        headers=headers,
        method='GET'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            account = json.loads(resp.read().decode('utf-8')).get("data")
            print(f"  Updated Status: {account.get('status')}")
            assert account.get('status') == "ACTIVE"
    except Exception as ex:
        print(f"Verification of status failed: {ex}")
        sys.exit(1)

    # 6. Force Password Change
    print("\n[Step 6] Forcing password change next login...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/employees/{employee_id}/account/force-password-change",
        data=b'',
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print("Force Password Change Call: SUCCESS")
    except Exception as ex:
        print(f"Force Password Change failed: {ex}")
        sys.exit(1)

    # Verify passwordChangeRequired is true
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/employees/{employee_id}/account",
        headers=headers,
        method='GET'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            account = json.loads(resp.read().decode('utf-8')).get("data")
            print(f"  Password Change Required: {account.get('passwordChangeRequired')}")
            assert account.get('passwordChangeRequired') is True
    except Exception as ex:
        print(f"Verification failed: {ex}")
        sys.exit(1)

    # 7. Generate Temporary Password
    print("\n[Step 7] Generating temporary password...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/employees/{employee_id}/account/generate-temp-password",
        data=b'',
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            res_data = json.loads(resp.read().decode('utf-8')).get("data")
            temp_pass = res_data.get("tempPassword")
            print(f"  Generated Temporary Password: {temp_pass}")
            assert temp_pass is not None
            assert len(temp_pass) >= 12
    except Exception as ex:
        print(f"Temp password generation failed: {ex}")
        sys.exit(1)

    # 8. Verify Audit Logs Timeline
    print("\n[Step 8] Checking audit logs and timeline events...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/employees/{employee_id}/account",
        headers=headers,
        method='GET'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            account = json.loads(resp.read().decode('utf-8')).get("data")
            logs = account.get("auditLogs", [])
            print(f"  Retrieved {len(logs)} audit logs from user account timeline:")
            for log in logs:
                print(f"    - Action: {log.get('action')}, Performed By: {log.get('performedBy')}, Detail: {log.get('changeSummary')}")
            
            # Verify we have entries like ACCOUNT_DISABLED, ACCOUNT_ENABLED, PASSWORD_CHANGED
            actions = [l.get("action") for l in logs]
            assert "ACCOUNT_DISABLED" in actions
            assert "ACCOUNT_ENABLED" in actions
    except Exception as ex:
        print(f"Verification of audit logs failed: {ex}")
        sys.exit(1)

    print("\n=== ALL ADMINISTRATIVE USER SECURITY OPERATIONS TESTED AND PASSED SUCCESSFULLY ===")

if __name__ == '__main__':
    run_tests()
