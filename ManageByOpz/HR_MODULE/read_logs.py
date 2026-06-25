import codecs

files = ["spring_boot_run_current.log", "spring_boot_run.log", "backend_run.log", "backend.log"]

for filename in files:
    try:
        # try utf-16 first
        with codecs.open(filename, 'r', encoding='utf-16') as f:
            lines = f.readlines()
        print(f"=== Last 50 lines of {filename} (UTF-16) ===")
        for line in lines[-50:]:
            print(line.strip())
        break
    except Exception as e1:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            print(f"=== Last 50 lines of {filename} (UTF-8) ===")
            for line in lines[-50:]:
                print(line.strip())
            break
        except Exception as e2:
            print(f"Failed to read {filename}: {e1}, {e2}")
