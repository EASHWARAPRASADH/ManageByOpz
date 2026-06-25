import urllib.request
import urllib.error
import json
import sys
import mysql.connector

def run_test():
    print("=== STARTING DOCUMENT VAULT INTEGRATION TEST ===")
    
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
            print("Admin successfully authenticated.")
    except urllib.error.HTTPError as err:
        print(f"Auth failed with HTTP status: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)
    except Exception as ex:
        print(f"Auth request failed: {ex}")
        sys.exit(1)
        
    # 2. Get Employee list and pick the first one
    print("\n[Step 2] Fetching employee directory...")
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/employees",
        headers={'Authorization': f'Bearer {token}'},
        method='GET'
    )
    
    employee_id = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            employees = json.loads(resp.read().decode('utf-8')).get("data", [])
            if not employees:
                print("No employees found to run the test on.")
                sys.exit(1)
            employee_id = employees[0].get("id")
            print(f"Selected employee ID: {employee_id}")
    except Exception as ex:
        print(f"Failed to get employees: {ex}")
        sys.exit(1)

    # 3. Get Active Documents
    print("\n[Step 3] Fetching active documents...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/employees/{employee_id}/documents",
        headers={'Authorization': f'Bearer {token}'},
        method='GET'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            docs = json.loads(resp.read().decode('utf-8')).get("data", [])
            print(f"Active documents count: {len(docs)}")
    except Exception as ex:
        print(f"Failed to get active documents: {ex}")
        sys.exit(1)

    # 4. Upload Document Version 1
    print("\n[Step 4] Uploading Document Version 1...")
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="documentType"\r\n\r\n'
        f'IDENTITY_PROOF\r\n'
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="documentName"\r\n\r\n'
        f'passport_v1.pdf\r\n'
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="expiryDate"\r\n\r\n'
        f'2030-12-31\r\n'
        f'--{boundary}--\r\n'
    ).encode('utf-8')
    
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/employees/{employee_id}/documents",
        data=body,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': f'multipart/form-data; boundary={boundary}'
        },
        method='POST'
    )
    
    doc1 = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            doc1 = resp_data.get("data")
            print("Document 1 uploaded successfully.")
            print(f"  ID: {doc1.get('id')}")
            print(f"  Name: {doc1.get('documentName')}")
            print(f"  Version: {doc1.get('versionNumber')}")
            print(f"  Path: {doc1.get('filePath')}")
    except Exception as ex:
        print(f"Failed to upload document 1: {ex}")
        sys.exit(1)

    # 5. Upload Document Version 2 (Replace)
    print("\n[Step 5] Uploading Document Version 2 (Replacing)...")
    body2 = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="documentType"\r\n\r\n'
        f'IDENTITY_PROOF\r\n'
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="documentName"\r\n\r\n'
        f'passport_v2_final.pdf\r\n'
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="expiryDate"\r\n\r\n'
        f'2031-01-01\r\n'
        f'--{boundary}--\r\n'
    ).encode('utf-8')
    
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/employees/{employee_id}/documents",
        data=body2,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': f'multipart/form-data; boundary={boundary}'
        },
        method='POST'
    )
    
    doc2 = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            doc2 = resp_data.get("data")
            print("Document 2 uploaded successfully.")
            print(f"  ID: {doc2.get('id')}")
            print(f"  Name: {doc2.get('documentName')}")
            print(f"  Version: {doc2.get('versionNumber')}")
            print(f"  Path: {doc2.get('filePath')}")
            expected_version2 = doc1.get('versionNumber') + 1
            if doc2.get('versionNumber') != expected_version2:
                print(f"[FAILURE] Expected version number {expected_version2}, got {doc2.get('versionNumber')}")
                sys.exit(1)
    except Exception as ex:
        print(f"Failed to upload document 2: {ex}")
        sys.exit(1)

    # 6. Fetch Document History
    print("\n[Step 6] Fetching Document History for IDENTITY_PROOF...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/employees/{employee_id}/documents/IDENTITY_PROOF/history",
        headers={'Authorization': f'Bearer {token}'},
        method='GET'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            history = json.loads(resp.read().decode('utf-8')).get("data", [])
            print(f"History list size: {len(history)}")
            for h in history:
                print(f"  Version: {h.get('versionNumber')}, Name: {h.get('documentName')}, ID: {h.get('id')}")
            if len(history) < 2:
                print(f"[FAILURE] Expected history to have at least 2 versions, got {len(history)}")
                sys.exit(1)
    except Exception as ex:
        print(f"Failed to get document history: {ex}")
        sys.exit(1)

    # 7. Restore Version 1
    print("\n[Step 7] Restoring Version 1 (ID: {}) as new latest...".format(doc1.get('id')))
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/employees/{employee_id}/documents/{doc1.get('id')}/restore",
        headers={'Authorization': f'Bearer {token}'},
        method='POST'
    )
    restored_doc = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            restored_doc = resp_data.get("data")
            print("Document version restored successfully.")
            print(f"  New Version: {restored_doc.get('versionNumber')}")
            print(f"  Restored Name: {restored_doc.get('documentName')}")
            expected_version3 = doc2.get('versionNumber') + 1
            if restored_doc.get('versionNumber') != expected_version3:
                print(f"[FAILURE] Expected version number {expected_version3}, got {restored_doc.get('versionNumber')}")
                sys.exit(1)
    except Exception as ex:
        print(f"Failed to restore version: {ex}")
        sys.exit(1)

    # 8. Query Database for Audit Logs
    print("\n[Step 8] Checking database audit logs for document operations...")
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Dhipak#2006#",
            database="managemyopz_hr",
            autocommit=True
        )
        cursor = conn.cursor()
        
        # Query for audit logs on EmployeeDocument entity
        cursor.execute(
            "SELECT action, performed_by, entity_id, before_json, after_json "
            "FROM audit_log WHERE entity_type = 'EmployeeDocument' ORDER BY created_at DESC LIMIT 3"
        )
        logs = cursor.fetchall()
        
        print(f"Found {len(logs)} audit log entries:")
        for log_entry in logs:
            action, performed_by, entity_id, before_json, after_json = log_entry
            print(f"  Action: {action}, PerformedBy: {performed_by}, EntityID: {entity_id}")
            print(f"    Before: {before_json}")
            print(f"    After: {after_json}")
            
        if len(logs) < 3:
            print("[FAILURE] Expected at least 3 audit log entries for EmployeeDocument.")
            sys.exit(1)
            
        conn.close()
        print("Database audit logs verification: SUCCESS")
    except Exception as ex:
        print(f"Database validation query failed: {ex}")
        sys.exit(1)

    print("\n=== ALL DOCUMENT VAULT INTEGRATION TESTS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_test()
