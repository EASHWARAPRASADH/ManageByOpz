import time
import sys

print("Waiting for HrmsPlatformApplication to start...")
start_time = time.time()
while time.time() - start_time < 30:
    try:
        with open("spring_boot_run_current.log", "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        if "Started HrmsPlatformApplication" in content:
            print("Server started successfully!")
            sys.exit(0)
    except Exception as e:
        pass
    time.sleep(1)

print("Server start timeout.")
sys.exit(1)
