import subprocess
import time
import urllib.request
import urllib.error
import json

print("Starting Spring Boot backend in background...")
with open("backend.log", "w") as log_file:
    p = subprocess.Popen(
        [r"d:\ManageMyOpz\HR_Module_02\apache-maven-3.9.6\bin\mvn.cmd", "-pl", "app-bootstrap", "spring-boot:run"],
        cwd=r"d:\ManageMyOpz\HR_Module_02\hrms-platform\backend",
        stdout=log_file,
        stderr=subprocess.STDOUT,
        text=True
    )

try:
    print("Waiting 15 seconds for backend to start up...")
    time.sleep(15)
    
    # Send login request
    print("Sending login request...")
    data = json.dumps({"email": "ultra.admin@managemyopz.com", "password": "Admin@123"}).encode('utf-8')
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/auth/login",
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"Response status code: {response.status}")
            print(f"Response content: {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as err:
        print(f"Response status code: {err.code}")
        print(f"Response content: {err.read().decode('utf-8')}")
        
        if err.code == 500:
            print("Retrieving the error stacktrace from backend.log...")
            time.sleep(2)
            with open("backend.log", "r") as f:
                lines = f.readlines()
                found = False
                for idx in range(len(lines) - 1, -1, -1):
                    line = lines[idx]
                    if "Exception" in line or "Error" in line or "NullPointerException" in line:
                        start = max(0, idx - 5)
                        end = min(len(lines), idx + 35)
                        print("--- Stack Trace Excerpt ---")
                        print("".join(lines[start:end]))
                        print("---------------------------")
                        found = True
                        break
                if not found:
                    print("No exception keyword found in backend.log. Dumping last 150 lines:")
                    print("".join(lines[-150:]))
    except Exception as ex:
        print(f"Request failed: {ex}")
finally:
    print("Stopping backend process...")
    p.terminate()
    try:
        p.wait(timeout=5)
    except subprocess.TimeoutExpired:
        p.kill()
    print("Backend stopped.")
