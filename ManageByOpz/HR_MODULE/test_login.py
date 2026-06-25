import urllib.request
import json

url = "http://localhost:8080/api/v1/auth/login"
passwords = ["password", "Password123", "admin123", "admin"]

for pwd in passwords:
    try:
        data = json.dumps({
            "email": "admin@managemyopz.com",
            "password": pwd
        }).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode('utf-8')
            print(f"Password '{pwd}': Status {response.status}, Response {res_data[:200]}")
    except urllib.error.HTTPError as e:
        print(f"Password '{pwd}': HTTP Error {e.code}, Response {e.read().decode('utf-8')[:200]}")
    except Exception as e:
        print(f"Error for password '{pwd}': {e}")
