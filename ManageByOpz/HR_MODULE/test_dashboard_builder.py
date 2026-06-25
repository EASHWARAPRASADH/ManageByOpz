import urllib.request
import json

BASE_URL = "http://localhost:8080/api/v1"

def test_dashboard_flow():
    print("=== Testing Dashboard Layout Persistence Flow ===")
    
    # 1. Login
    login_url = f"{BASE_URL}/auth/login"
    login_data = json.dumps({
        "email": "admin@managemyopz.com",
        "password": "Admin@123"
    }).encode("utf-8")
    
    req = urllib.request.Request(
        login_url,
        data=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            login_res = json.loads(resp.read().decode())
            token = login_res["accessToken"]
            print("Successfully logged in. Token acquired.")
    except Exception as e:
        print(f"Login failed: {e}")
        return

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 2. Get Layout
    layout_url = f"{BASE_URL}/dashboard/layouts/my-layout"
    req_get = urllib.request.Request(layout_url, headers=headers)
    
    try:
        with urllib.request.urlopen(req_get) as resp:
            layout_res = json.loads(resp.read().decode())
            layout = layout_res["data"]
            print("Loaded current layout:")
            print(json.dumps(layout, indent=2))
    except Exception as e:
        print(f"Failed to fetch layout: {e}")
        return

    # 3. Modify Layout
    layout["widgets"] = [
        {
            "widgetKey": "headcount",
            "componentName": "HeadcountWidget",
            "title": "Interactive Headcount Stats",
            "x": 2,
            "y": 1,
            "w": 5,
            "h": 4,
            "visible": True
        },
        {
            "widgetKey": "pending_approvals",
            "componentName": "PendingApprovalsWidget",
            "title": "My Approvals Dashboard",
            "x": 0,
            "y": 5,
            "w": 4,
            "h": 2,
            "visible": False
        }
    ]

    # 4. Save Layout
    save_url = f"{BASE_URL}/dashboard/layouts/save"
    save_data = json.dumps(layout).encode("utf-8")
    req_save = urllib.request.Request(save_url, data=save_data, headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req_save) as resp:
            save_res = json.loads(resp.read().decode())
            print("\nSave layout response status:", save_res.get("status"))
            print("Save layout message:", save_res.get("message"))
    except Exception as e:
        print(f"Failed to save layout: {e}")
        return

    # 5. Fetch Layout Again & Verify
    print("\nVerifying saved layout preferences...")
    req_get_again = urllib.request.Request(layout_url, headers=headers)
    try:
        with urllib.request.urlopen(req_get_again) as resp:
            verify_res = json.loads(resp.read().decode())
            verify_layout = verify_res["data"]
            
            headcount_widget = next(w for w in verify_layout["widgets"] if w["widgetKey"] == "headcount")
            approvals_widget = next(w for w in verify_layout["widgets"] if w["widgetKey"] == "pending_approvals")
            
            assert headcount_widget["title"] == "Interactive Headcount Stats", "Title did not match"
            assert headcount_widget["x"] == 2, "X coordinate did not match"
            assert headcount_widget["y"] == 1, "Y coordinate did not match"
            assert headcount_widget["w"] == 5, "Width did not match"
            assert headcount_widget["h"] == 4, "Height did not match"
            assert approvals_widget["visible"] is False, "Visibility toggle did not match"
            
            print("SUCCESS: All modified widget coordinates, titles, and visibilities were persisted and verified correctly!")
    except Exception as e:
        print(f"Verification failed: {e}")

if __name__ == "__main__":
    test_dashboard_flow()
