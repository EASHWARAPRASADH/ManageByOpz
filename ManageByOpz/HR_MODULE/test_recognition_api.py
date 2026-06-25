import urllib.request
import json

def make_request(url, method="GET", body=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
        
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode('utf-8')
            return response.status, json.loads(res_data) if res_data else None
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code} for {url}: {e.read().decode('utf-8')}")
        return e.code, None

# 1. Login
login_url = "http://localhost:8080/api/v1/auth/login"
status, login_res = make_request(login_url, "POST", {
    "email": "admin@managemyopz.com",
    "password": "Admin@123"
})

if status == 200 and login_res:
    token = login_res.get("accessToken")
    print(f"Logged in successfully. Token obtained: {token[:20]}...")
    
    # 2. Get Employees
    emp_url = "http://localhost:8080/api/v1/employees"
    status, emp_res = make_request(emp_url, "GET", token=token)
    if status == 200 and emp_res:
        emp_list = emp_res.get("data", [])
        employee_ids = [emp["id"] for emp in emp_list if "id" in emp]
        print(f"Retrieved {len(employee_ids)} employee IDs.")
        
        # 3. Get Health Report
        health_url = "http://localhost:8080/api/v1/recognition/health/report"
        status, report = make_request(health_url, "POST", employee_ids, token=token)
        if status == 200 and report:
            print("\n=== INITIAL HEALTH REPORT ===")
            print(json.dumps(report, indent=2))
            
            report_data = report.get("data", {})
            missing_wallets = report_data.get("employeesWithoutWallet", [])
            if missing_wallets:
                print(f"\nMissing wallets detected for {len(missing_wallets)} employees. Provisioning...")
                
                # 4. Provision Wallets
                prov_url = "http://localhost:8080/api/v1/recognition/health/provision-wallets"
                status, prov_res = make_request(prov_url, "POST", employee_ids, token=token)
                if status == 200:
                    print("Wallets provisioned successfully!")
                    
                    # 5. Fetch Health Report again to confirm
                    status, final_report = make_request(health_url, "POST", employee_ids, token=token)
                    if status == 200 and final_report:
                        print("\n=== FINAL HEALTH REPORT ===")
                        print(json.dumps(final_report, indent=2))
            else:
                print("\nAll employees already have point wallets provisioned!")
else:
    print("Login failed.")
