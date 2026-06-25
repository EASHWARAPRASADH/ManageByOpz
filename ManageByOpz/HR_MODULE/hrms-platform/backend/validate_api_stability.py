"""
Comprehensive API Stability Validation Script
Tests: Auth, Org-DNA endpoints, Recruitment Config endpoints, Serialization depth
"""
import urllib.request
import urllib.error
import json
import sys

BASE = "http://localhost:8080/api"
RESULTS = []

def login():
    req = urllib.request.Request(
        f"{BASE}/v1/auth/login",
        data=json.dumps({"email": "admin@managemyopz.com", "password": "Admin@123"}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    resp = urllib.request.urlopen(req, timeout=10)
    data = json.loads(resp.read())
    return data.get("accessToken")

def api_get(path, token, tenant="ACME"):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "X-Tenant-ID": tenant
    }
    req = urllib.request.Request(f"{BASE}{path}", headers=headers, method="GET")
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        body = resp.read().decode()
        data = json.loads(body)
        return resp.status, data, len(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return e.code, body, len(body)
    except Exception as ex:
        return 0, str(ex), 0

def test(name, path, token, expect_key=None):
    status, data, size = api_get(path, token)
    passed = status == 200
    detail = ""
    if passed and expect_key and isinstance(data, dict):
        if expect_key not in data:
            passed = False
            detail = f" (missing key '{expect_key}')"
        else:
            val = data[expect_key]
            if isinstance(val, list):
                detail = f" ({len(val)} items, {size} bytes)"
            else:
                detail = f" ({size} bytes)"
    elif not passed:
        detail = f" (status={status})"
    
    result = "PASS" if passed else "FAIL"
    RESULTS.append((name, result, detail))
    print(f"  [{result}] {name}{detail}")
    return passed, data

def check_nesting_depth(obj, max_depth=50, current=0):
    """Recursively check JSON nesting depth to detect serialization loops."""
    if current > max_depth:
        return current
    if isinstance(obj, dict):
        depths = [check_nesting_depth(v, max_depth, current + 1) for v in obj.values()]
        return max(depths) if depths else current
    elif isinstance(obj, list):
        depths = [check_nesting_depth(item, max_depth, current + 1) for item in obj]
        return max(depths) if depths else current
    return current

if __name__ == "__main__":
    print("=" * 70)
    print("  HRMS PLATFORM API STABILITY VALIDATION")
    print("=" * 70)

    # 1. Authentication
    print("\n[1] Authentication & Token Acquisition")
    try:
        token = login()
        print(f"  [PASS] JWT Token acquired ({len(token)} chars)")
        RESULTS.append(("Auth Login", "PASS", ""))
    except Exception as e:
        print(f"  [FAIL] Auth failed: {e}")
        RESULTS.append(("Auth Login", "FAIL", str(e)))
        sys.exit(1)

    # 2. Org-DNA: Organizations
    print("\n[2] Org-DNA Endpoints")
    ok, org_data = test("GET /organizations", "/v1/org-dna/organizations", token, "data")
    
    org_id = None
    if ok and isinstance(org_data, dict) and isinstance(org_data.get("data"), list) and len(org_data["data"]) > 0:
        org_id = org_data["data"][0].get("id")
        print(f"      Active Org ID: {org_id}")
        
        # Check serialization depth of organization response
        depth = check_nesting_depth(org_data)
        if depth > 20:
            print(f"  [WARN] Organization response nesting depth: {depth} (potential loop)")
            RESULTS.append(("Org Nesting Depth", "WARN", f"depth={depth}"))
        else:
            print(f"  [PASS] Organization response nesting depth: {depth} (safe)")
            RESULTS.append(("Org Nesting Depth", "PASS", f"depth={depth}"))

    if org_id:
        test("GET /business-units", f"/v1/org-dna/organizations/{org_id}/business-units", token, "data")
        test("GET /locations", f"/v1/org-dna/organizations/{org_id}/locations", token, "data")
        test("GET /grades", f"/v1/org-dna/organizations/{org_id}/grades", token, "data")
        test("GET /bands", f"/v1/org-dna/organizations/{org_id}/bands", token, "data")
        test("GET /designations", f"/v1/org-dna/organizations/{org_id}/designations", token, "data")
        test("GET /employment-types", f"/v1/org-dna/organizations/{org_id}/employment-types", token, "data")
        test("GET /cost-centers", f"/v1/org-dna/organizations/{org_id}/cost-centers", token, "data")
        
        # Get BU ID for cascading tests
        _, bu_data, _ = api_get(f"/v1/org-dna/organizations/{org_id}/business-units", token)
        if isinstance(bu_data, dict) and isinstance(bu_data.get("data"), list) and len(bu_data["data"]) > 0:
            bu_id = bu_data["data"][0]["id"]
            test("GET /divisions (cascading)", f"/v1/org-dna/business-units/{bu_id}/divisions", token, "data")
            
            _, div_data, _ = api_get(f"/v1/org-dna/business-units/{bu_id}/divisions", token)
            if isinstance(div_data, dict) and isinstance(div_data.get("data"), list) and len(div_data["data"]) > 0:
                div_id = div_data["data"][0]["id"]
                test("GET /departments (cascading)", f"/v1/org-dna/divisions/{div_id}/departments", token, "data")
                
                _, dept_data, _ = api_get(f"/v1/org-dna/divisions/{div_id}/departments", token)
                if isinstance(dept_data, dict) and isinstance(dept_data.get("data"), list) and len(dept_data["data"]) > 0:
                    dept_id = dept_data["data"][0]["id"]
                    test("GET /teams (cascading)", f"/v1/org-dna/departments/{dept_id}/teams", token, "data")

    # 3. Recruitment Config Endpoints
    print("\n[3] Recruitment Config Endpoints")
    test("GET /hiring-reasons", "/v1/recruitment/config/hiring-reasons", token, "data")
    test("GET /skills", "/v1/recruitment/config/skills", token, "data")
    test("GET /stages", "/v1/recruitment/config/stages", token, "data")
    test("GET /interview-types", "/v1/recruitment/config/interview-types", token, "data")
    test("GET /templates", "/v1/recruitment/config/templates", token, "data")
    test("GET /notification/rules", "/v1/recruitment/config/notification/rules", token, "data")
    
    # Query forms first, then check fields for a form if available
    ok_forms, forms_data = test("GET /forms", "/v1/recruitment/config/forms", token, "data")
    if ok_forms and isinstance(forms_data, dict) and isinstance(forms_data.get("data"), list) and len(forms_data["data"]) > 0:
        form_id = forms_data["data"][0].get("id")
        test(f"GET /forms/{form_id}/fields", f"/v1/recruitment/config/forms/{form_id}/fields", token, "data")

    # 4. Recruitment Core Endpoints
    print("\n[4] Recruitment Core Endpoints")
    test("GET /requisitions", "/v1/recruitment/requisitions", token, "data")
    test("GET /jobs", "/v1/recruitment/jobs", token, "data")
    test("GET /candidates", "/v1/recruitment/candidates", token, "data")
    test("GET /interviews", "/v1/recruitment/interviews", token, "data")
    test("GET /offers", "/v1/recruitment/offers", token, "data")

    # 5. Approval Matrix
    print("\n[5] Approval Matrix Endpoint")
    test("GET /approval-matrices", "/v1/org-dna/approval-matrices", token, "data")

    # Summary
    print("\n" + "=" * 70)
    total = len(RESULTS)
    passed = sum(1 for _, r, _ in RESULTS if r == "PASS")
    failed = sum(1 for _, r, _ in RESULTS if r == "FAIL")
    warned = sum(1 for _, r, _ in RESULTS if r == "WARN")
    print(f"  RESULTS: {passed}/{total} PASSED | {failed} FAILED | {warned} WARNINGS")
    
    if failed > 0:
        print("\n  FAILED TESTS:")
        for name, r, d in RESULTS:
            if r == "FAIL":
                print(f"    [X] {name}{d}")
    
    print("=" * 70)
    sys.exit(1 if failed > 0 else 0)
