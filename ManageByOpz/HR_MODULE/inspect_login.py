import urllib.request
import json

url = "http://localhost:8080/api/v1/auth/login"
data = json.dumps({"email": "admin@managemyopz.com", "password": "Admin@123"}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method='POST')

try:
    with urllib.request.urlopen(req) as resp:
        print("Status:", resp.status)
        print(resp.read().decode())
except Exception as e:
    print(e)
