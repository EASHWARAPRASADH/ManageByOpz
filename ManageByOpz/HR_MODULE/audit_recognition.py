import urllib.request
import json
import traceback

def get_token(email, password):
    url = "http://localhost:8080/api/v1/auth/login"
    data = json.dumps({"email": email, "password": password}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode())
            return res["accessToken"], res["user"]["id"], res["user"]["tenantId"]
    except Exception as e:
        print(f"Failed to login {email}: {e}")
        return None, None, None

def test_api(name, path, token, method='GET', body=None):
    url = f"http://localhost:8080/api{path}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode()
            print(f"[SUCCESS] {name} ({method} {path}) -> Status {resp.status}")
            try:
                res_json = json.loads(content)
                # Print a small summary of data
                if "data" in res_json:
                    d = res_json["data"]
                    if isinstance(d, list):
                        print(f"    Returned list of {len(d)} items")
                    else:
                        print(f"    Returned object: {str(d)[:100]}")
            except:
                print(f"    Response body: {content[:200]}")
            return True
    except urllib.error.HTTPError as e:
        print(f"[FAIL] {name} ({method} {path}) -> Status {e.code}")
        print(f"    Error response: {e.read().decode()}")
        return False
    except Exception as e:
        print(f"[ERROR] {name} ({method} {path}) -> Exception: {e}")
        return False

def run_audit():
    print("Logging in as employee@managemyopz.com...")
    emp_token, emp_id, emp_tenant = get_token("employee@managemyopz.com", "Admin@123")
    print(f"Logged in. Employee ID: {emp_id}, Tenant: {emp_tenant}")
    
    print("\n--- Auditing Employee APIs ---")
    test_api("Get Core Values", "/v1/recognition/values", emp_token)
    test_api("Get Recognition Types", "/v1/recognition/types", emp_token)
    test_api("Get Wallet", f"/v1/recognition/wallet/{emp_id}", emp_token)
    test_api("Get Recognition Feed", "/v1/recognition/feed", emp_token)
    test_api("Get Rewards Catalog", "/v1/recognition/rewards/catalog", emp_token)
    test_api("Get Award Programs", "/v1/recognition/awards/programs", emp_token)
    test_api("Get Leaderboard", "/v1/recognition/leaderboard", emp_token)
    test_api("Get Culture Analytics", "/v1/recognition/analytics", emp_token)
    test_api("Get AI Insights", "/v1/recognition/ai/insights", emp_token)
    test_api("Get Redemptions", f"/v1/recognition/rewards/redemptions?employeeId={emp_id}", emp_token)

    print("\nLogging in as admin@managemyopz.com...")
    admin_token, admin_id, admin_tenant = get_token("admin@managemyopz.com", "Admin@123")
    print(f"Logged in. Admin ID: {admin_id}, Tenant: {admin_tenant}")

    print("\n--- Auditing Admin APIs ---")
    # Let's see if admin can view all redemptions
    test_api("Get All Redemptions", "/v1/recognition/rewards/redemptions", admin_token)

if __name__ == "__main__":
    run_audit()
