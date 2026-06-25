import subprocess

print("Running mvn spring-boot:run to capture error logs...")
p = subprocess.Popen(
    [r"d:\ManageMyOpz\HR_Module_02\apache-maven-3.9.6\bin\mvn.cmd", "-pl", "app-bootstrap", "spring-boot:run"],
    cwd=r"d:\ManageMyOpz\HR_Module_02\hrms-platform\backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True
)

# Read first 150 lines or wait for exit
lines = []
for i in range(150):
    line = p.stdout.readline()
    if not line:
        break
    lines.append(line)
    print(line, end="")

p.kill()
