import subprocess
import time

print("Starting Spring Boot and redirecting logs to spring_boot_run_current.log...")
with open("spring_boot_run_current.log", "w", encoding="utf-8") as log_file:
    p = subprocess.Popen(
        [r"d:\ManageMyOpz\HR_Module_02\apache-maven-3.9.6\bin\mvn.cmd", "-pl", "app-bootstrap", "spring-boot:run"],
        cwd=r"d:\ManageMyOpz\HR_Module_02\hrms-platform\backend",
        stdout=log_file,
        stderr=subprocess.STDOUT
    )
print("Spring Boot process started. PID:", p.pid)
