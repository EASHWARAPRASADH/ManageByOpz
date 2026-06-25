import urllib.request
import urllib.error
import json
import sys

BASE = "http://localhost:8080/api"

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
        return resp.status, data
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return e.code, body
    except Exception as ex:
        return 0, str(ex)

if __name__ == "__main__":
    token = login()
    print("Logged in. Token acquired.")
    status, data = api_get("/v1/workflow/tasks", token)
    print("Status:", status)
    print("Data:", json.dumps(data, indent=2))
    if status == 200:
        print("[PASS] Workflow tasks retrieved successfully!")
        sys.exit(0)
    else:
        print("[FAIL] Workflow tasks failed to retrieve.")
        sys.exit(1)
