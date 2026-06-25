import urllib.request
import urllib.error
import json
import sys

def run_test():
    print("=== STARTING ORG DNA ENDPOINTS INTEGRATION TEST ===")
    
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
            print("Successfully authenticated as Admin.")
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

    # 2. Retrieve existing Organizations to get the Organization ID
    print("\n[Step 2] Fetching Organizations...")
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/org-dna/organizations",
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        },
        method='GET'
    )
    
    org_id = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            orgs = json.loads(resp.read().decode('utf-8')).get("data", [])
            print(f"Retrieved {len(orgs)} organizations.")
            if orgs:
                org_id = orgs[0].get("id")
                print(f"Selected Org ID: {org_id}")
            else:
                print("No organization found to query Business Units.")
                sys.exit(1)
    except Exception as ex:
        print(f"Failed to fetch organizations: {ex}")
        sys.exit(1)

    # 3. Retrieve Business Units for the organization
    print(f"\n[Step 3] Fetching Business Units for Org: {org_id}...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/org-dna/organizations/{org_id}/business-units",
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        },
        method='GET'
    )
    
    bu_id = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            bus = json.loads(resp.read().decode('utf-8')).get("data", [])
            print(f"Retrieved {len(bus)} business units.")
            for bu in bus:
                print(f" - BU: {bu.get('name')} ({bu.get('code')}) ID: {bu.get('id')}")
            if bus:
                bu_id = bus[0].get("id")
                print(f"Selected BU for cloning: {bus[0].get('name')} (ID: {bu_id})")
            else:
                print("No business unit found to clone.")
                sys.exit(1)
    except Exception as ex:
        print(f"Failed to fetch business units: {ex}")
        sys.exit(1)

    # 4. Clone the selected Business Unit
    print(f"\n[Step 4] Requesting clone of Business Unit {bu_id}...")
    target_name = "Cloned Marketing and Sales"
    target_code = "BU_MKT_CLONE"
    
    # URL parameters
    clone_url = f"http://localhost:8080/api/v1/org-dna/business-units/{bu_id}/clone?targetName={urllib.parse.quote(target_name)}&targetCode={urllib.parse.quote(target_code)}"
    
    req = urllib.request.Request(
        clone_url,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        },
        method='POST'
    )
    
    cloned_bu = None
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            cloned_bu = resp_data.get("data")
            print("Cloning Response status:", resp.status)
            print("Success Message:", resp_data.get("message"))
            print(f"Successfully cloned BU. New BU Details:")
            print(f"  Name: {cloned_bu.get('name')}")
            print(f"  Code: {cloned_bu.get('code')}")
            print(f"  ID: {cloned_bu.get('id')}")
            print(f"  Effective Date: {cloned_bu.get('effectiveDate')}")
    except urllib.error.HTTPError as err:
        print(f"Cloning failed with HTTP status: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)
    except Exception as ex:
        print(f"Cloning request failed: {ex}")
        sys.exit(1)

    # 5. Fetch Audit Trail History
    for current_id, name in [(bu_id, "Source BU"), (cloned_bu.get('id'), "Cloned BU")]:
        print(f"\n[Step 5] Retrieving Audit Trail for {name} ({current_id})...")
        audit_url = f"http://localhost:8080/api/v1/org-dna/audit-trail?entityType=BusinessUnit&entityId={current_id}&page=0&size=10"
        
        req = urllib.request.Request(
            audit_url,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            },
            method='GET'
        )
        
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_data = json.loads(resp.read().decode('utf-8'))
                audit_page = resp_data.get("data", {})
                audit_logs = audit_page.get("content", [])
                print(f"Retrieved {len(audit_logs)} audit log records for {name}.")
                for log in audit_logs:
                    print(f" - Action: {log.get('action')}, Performed By: {log.get('performedBy')} ({log.get('performedByRole')}), Performed At: {log.get('performedAt')}")
                    print(f"   Summary: {log.get('changeSummary')}")
        except urllib.error.HTTPError as err:
            print(f"Failed to retrieve audit trail for {name}: {err.code}")
            print(err.read().decode('utf-8'))
            sys.exit(1)
        except Exception as ex:
            print(f"Audit request failed for {name}: {ex}")
            sys.exit(1)

    print("\n=== ORG DNA INTEGRATION CHECKS COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_test()
