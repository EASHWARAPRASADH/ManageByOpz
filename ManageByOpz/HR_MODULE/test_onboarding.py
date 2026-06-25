import urllib.request
import urllib.error
import json
import sys
import mysql.connector
import random

def run_test():
    print("=== STARTING FULL END-TO-END SECURITY PROVISIONING INTEGRATION TEST ===")
    
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
    except urllib.error.HTTPError as err:
        print(f"Auth failed with HTTP status: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)
    except Exception as ex:
        print(f"Auth request failed: {ex}")
        sys.exit(1)
        
    if not token:
        print("Failed to retrieve token from auth response.")
        sys.exit(1)

    # 2. Invoke Onboarding Orchestrator Endpoint
    print("\n[Step 2] Sending onboarding request to /api/v1/onboarding...")
    
    emp_suffix = str(random.randint(1000, 9999))
    work_email = f"alex.rivera.{emp_suffix}@managemyopz.com"

    # Construct complete payload representing all 8 wizard steps
    onboarding_payload = {
        "firstName": "Alex",
        "lastName": "Rivera",
        "workEmail": work_email,
        "personalEmail": f"alex.rivera.personal.{emp_suffix}@gmail.com",
        "phone": "9876543210",
        "emergencyPhone": "9876543211",
        "gender": "MALE",
        "dateOfBirth": "1992-04-15",
        
        "organizationId": "6841af62-9c16-431b-a8c2-a3adba1dc47a",
        "dateOfJoining": "2026-07-01",
        "department": "Engineering",
        "designation": "Staff Software Engineer",
        "location": "San Francisco, CA",
        "workMode": "HYBRID",
        "employmentStatus": "ACTIVE",
        
        "pan": "ABCDE9999F",
        "aadhaar": "999988887777",
        "uan": "100990099009",
        "esic": "31123456780011002",
        
        "bankName": "Silicon Valley Bank",
        "accountNumber": "9988112244",
        "ifsc": "SVTX0000231",
        
        "skills": [
            {"skillName": "React", "skillLevel": "EXPERT"},
            {"skillName": "Spring Boot", "skillLevel": "EXPERT"}
        ],
        "certifications": [
            {"certificationName": "AWS Solutions Architect", "issuer": "Amazon Web Services"}
        ],
        
        "relationships": [
            {"relationshipType": "MANAGER", "relatedEmployeeId": "00000000-0000-0000-0000-000000000003"},
            {"relationshipType": "HRBP", "relatedEmployeeId": "00000000-0000-0000-0000-000000000003"}
        ],
        
        "documents": [
            {
                "documentType": "IDENTITY_DOC",
                "documentName": "passport.pdf",
                "documentUrl": "https://storage.managemyopz.com/docs/passport.pdf",
                "verificationStatus": "PENDING"
            }
        ]
    }
    
    payload_bytes = json.dumps(onboarding_payload).encode('utf-8')
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/onboarding",
        data=payload_bytes,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        },
        method='POST'
    )
    
    created_employee = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            print("Onboarding Response Code:", resp.status)
            print("Success Message:", resp_data.get("message"))
            created_employee = resp_data.get("data")
            print("Created Digital Twin ID:", created_employee.get("id"))
            print("System Generated Employee Code:", created_employee.get("employeeCode"))
    except urllib.error.HTTPError as err:
        print(f"Onboarding failed with HTTP status: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)
    except Exception as ex:
        print(f"Onboarding request failed: {ex}")
        sys.exit(1)

    # 3. Retrieve Employees Directory List to verify new twin exists
    print("\n[Step 3] Fetching Employee Directory to verify record...")
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/employees",
        headers={
            'Authorization': f'Bearer {token}'
        },
        method='GET'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            employees = json.loads(resp.read().decode('utf-8')).get("data", [])
            print(f"Retrieved {len(employees)} employees from registry.")
            
            # Check if our created employee is in the registry
            found = False
            for emp in employees:
                if emp.get("id") == created_employee.get("id"):
                    print(f"Found newly onboarded employee twin in the registry!")
                    found = True
                    break
            
            if not found:
                print("\n[FAILURE] Newly onboarded employee was not found in the directory response.")
                sys.exit(1)
                
    except urllib.error.HTTPError as err:
        print(f"Failed to retrieve directory: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)
    except Exception as ex:
        print(f"Directory request failed: {ex}")
        sys.exit(1)

    # 4. Connect to database to fetch the newly created user and their activation token
    print("\n[Step 4] Querying database for user account and activation details...")
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Dhipak#2006#",
            database="managemyopz_hr",
            autocommit=True
        )
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT username, email, status, activation_token, password_change_required "
            "FROM users WHERE employee_id = %s",
            (created_employee.get("id"),)
        )
        user_row = cursor.fetchone()
        
        if not user_row:
            print("[FAILURE] No user account was provisioned in database for employee twin ID:", created_employee.get("id"))
            sys.exit(1)
            
        username, email, status, activation_token, pwd_change_required = user_row
        print(f"Provisioned User found:")
        print(f"  Username: {username}")
        print(f"  Email: {email}")
        print(f"  Status: {status}")
        print(f"  Activation Token: {activation_token}")
        print(f"  Password Change Required: {pwd_change_required}")
        
        if status != "PENDING_ACTIVATION":
            print(f"[FAILURE] Expected user status 'PENDING_ACTIVATION', got '{status}'")
            sys.exit(1)
            
        if not activation_token:
            print("[FAILURE] Activation token was not generated.")
            sys.exit(1)
            
        if pwd_change_required != 1:
            print("[FAILURE] Password change should be required (expected 1).")
            sys.exit(1)
            
        conn.close()
    except Exception as ex:
        print(f"Database query failed: {ex}")
        sys.exit(1)

    # 5. Call activate account API endpoint
    print("\n[Step 5] Triggering account activation via Auth API...")
    new_password = "SecurePassword@123"
    activate_payload = json.dumps({
        "token": activation_token,
        "password": new_password
    }).encode('utf-8')
    
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/auth/activate",
        data=activate_payload,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            print("Activation API response:", resp_data.get("message"))
    except urllib.error.HTTPError as err:
        print(f"Activation failed with status {err.code}:")
        print(err.read().decode('utf-8'))
        sys.exit(1)
    except Exception as ex:
        print(f"Activation request failed: {ex}")
        sys.exit(1)

    # 6. Verify status transitions to ACTIVE and fields are cleared in database
    print("\n[Step 6] Verifying user status transition and token clearance in database...")
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Dhipak#2006#",
            database="managemyopz_hr",
            autocommit=True
        )
        cursor = conn.cursor()
        cursor.execute(
            "SELECT status, activation_token, activation_token_expiry, password_change_required, activated_at "
            "FROM users WHERE employee_id = %s",
            (created_employee.get("id"),)
        )
        status, token_val, token_exp, pwd_change_req, activated_at = cursor.fetchone()
        
        print(f"Updated User database fields:")
        print(f"  Status: {status}")
        print(f"  Activation Token: {token_val}")
        print(f"  Activation Token Expiry: {token_exp}")
        print(f"  Password Change Required: {pwd_change_req}")
        print(f"  Activated At: {activated_at}")
        
        if status != "ACTIVE":
            print(f"[FAILURE] User status did not transition to ACTIVE. Current status: {status}")
            sys.exit(1)
            
        if token_val is not None or token_exp is not None:
            print("[FAILURE] Activation token fields were not cleared.")
            sys.exit(1)
            
        if pwd_change_req != 0:
            print("[FAILURE] Password change required flag was not reset to 0.")
            sys.exit(1)
            
        if activated_at is None:
            print("[FAILURE] activated_at timestamp was not set.")
            sys.exit(1)
            
        conn.close()
        print("Database integrity verification: SUCCESS")
    except Exception as ex:
        print(f"Database validation query failed: {ex}")
        sys.exit(1)

    # 7. Authenticate as the new employee with their activated credentials
    print("\n[Step 7] Logging in as the newly activated employee...")
    emp_login_data = json.dumps({
        "email": work_email,
        "password": new_password
    }).encode('utf-8')
    
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/auth/login",
        data=emp_login_data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    emp_token = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            emp_token = resp_data.get("accessToken")
            print("Employee successfully authenticated.")
            print("User Object in Response:")
            print("  Name:", resp_data.get("user", {}).get("name"))
            print("  Role:", resp_data.get("user", {}).get("role"))
            print("  TenantId:", resp_data.get("user", {}).get("tenantId"))
    except urllib.error.HTTPError as err:
        print(f"Employee login failed with HTTP status: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)
    except Exception as ex:
        print(f"Employee login request failed: {ex}")
        sys.exit(1)

    # 8. Call /me endpoint to verify auth token validity and response info
    print("\n[Step 8] Calling /me endpoint using employee access token...")
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/auth/me",
        headers={'Authorization': f'Bearer {emp_token}'},
        method='GET'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            print("Response /me profile info:")
            print("  Name:", resp_data.get("user", {}).get("name"))
            print("  Email:", resp_data.get("user", {}).get("email"))
            print("  Role:", resp_data.get("user", {}).get("role"))
            print("  Tenant:", resp_data.get("user", {}).get("tenantId"))
    except urllib.error.HTTPError as err:
        print(f"Calling /me failed with HTTP status: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)
    except Exception as ex:
        print(f"/me request failed: {ex}")
        sys.exit(1)

    print("\n=== ALL END-TO-END SECURITY PROVISIONING INTEGRATION TESTS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_test()
