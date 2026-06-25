import os

search_terms = ["Created user account", "assigned ROLE", "c.m.t.c.OnboardingController", "acme-000009"]

for root, dirs, files in os.walk("d:\\ManageMyOpz\\HR_Module_02"):
    for file in files:
        if file.endswith(".java") or file.endswith(".xml") or file.endswith(".properties") or file.endswith(".sql"):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    for i, line in enumerate(f, 1):
                        for term in search_terms:
                            if term.lower() in line.lower():
                                print(f"{filepath}:{i}: {line.strip()}")
            except Exception as e:
                pass
