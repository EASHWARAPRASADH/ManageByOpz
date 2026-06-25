import mysql.connector
import uuid

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )

def seed_data():
    conn = get_connection()
    cursor = conn.cursor()
    
    # We want to seed for both 'ACME' and 'default' tenants to ensure availability across all test accounts.
    tenants = ['ACME', 'default']
    
    for tenant in tenants:
        print(f"\n--- Seeding for Tenant: {tenant} ---")
        
        # 1. Organization
        org_id = uuid.uuid4().bytes
        org_code = "ACME" if tenant == 'ACME' else "ACME-DFT"
        cursor.execute("""
            INSERT INTO organizations (id, tenant_id, name, code, legal_name, country, currency, timezone, registration_number, tax_id, website, primary_email, primary_phone, active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
            ON DUPLICATE KEY UPDATE name=VALUES(name)
        """, (org_id, tenant, "Acme Corporation", org_code, "Acme Corporation Corp", "India", "INR", "Asia/Kolkata", "REG-12345", "TAX-9988", "https://acme.org", "info@acme.org", "+919876543210"))
        
        # Fetch the org id if duplicate key updated
        cursor.execute("SELECT id FROM organizations WHERE tenant_id=%s AND code=%s", (tenant, org_code))
        org_id = cursor.fetchone()[0]
        
        # 2. Business Units
        bus = [
            ("Technology", "TECH", "Technology Business Unit"),
            ("Finance", "FIN", "Finance and Accounts Business Unit"),
            ("Sales", "SALES", "Global Sales Business Unit"),
            ("HR", "HR", "Human Resources Business Unit")
        ]
        bu_ids = {}
        for name, code, desc in bus:
            bu_id = uuid.uuid4().bytes
            cursor.execute("""
                INSERT INTO business_units (id, tenant_id, organization_id, name, code, description, active)
                VALUES (%s, %s, %s, %s, %s, %s, 1)
            """, (bu_id, tenant, org_id, name, code, desc))
            bu_ids[code] = bu_id
            
        # 3. Divisions
        divs = [
            ("Product Engineering", "PE", "Core Product Engineering", "TECH"),
            ("Infrastructure", "INFRA", "IT and Cloud Infrastructure", "TECH"),
            ("Security", "SEC", "Information Security", "TECH")
        ]
        div_ids = {}
        for name, code, desc, bu_code in divs:
            div_id = uuid.uuid4().bytes
            cursor.execute("""
                INSERT INTO divisions (id, tenant_id, business_unit_id, name, code, description, active)
                VALUES (%s, %s, %s, %s, %s, %s, 1)
            """, (div_id, tenant, bu_ids[bu_code], name, code, desc))
            div_ids[code] = div_id
            
        # 4. Departments
        depts = [
            ("Frontend Engineering", "FE", "Frontend Web & Mobile App development", "PE"),
            ("Backend Engineering", "BE", "Backend services and microservices", "PE"),
            ("DevOps", "DEVOPS", "CI/CD and deployment automation", "PE"),
            ("QA", "QA", "Quality Assurance and testing", "PE"),
            ("HR Operations", "HR-OPS", "Core HR operational processes", "PE") # placed under PE as a demo child
        ]
        dept_ids = {}
        for name, code, desc, div_code in depts:
            dept_id = uuid.uuid4().bytes
            cursor.execute("""
                INSERT INTO departments (id, tenant_id, division_id, name, code, description, active)
                VALUES (%s, %s, %s, %s, %s, %s, 1)
            """, (dept_id, tenant, div_ids[div_code], name, code, desc))
            dept_ids[code] = dept_id
            
        # 5. Sub Departments
        sub_depts = [
            ("React Frontend Team", "REACT-FE", "React engineering team", "FE"),
            ("API Services Team", "API-BE", "REST & GraphQL API team", "BE")
        ]
        for name, code, desc, dept_code in sub_depts:
            sub_id = uuid.uuid4().bytes
            cursor.execute("""
                INSERT INTO sub_departments (id, tenant_id, department_id, name, code, description, active)
                VALUES (%s, %s, %s, %s, %s, %s, 1)
            """, (sub_id, tenant, dept_ids[dept_code], name, code, desc))
            
        # 6. Locations
        locs = [
            ("Puducherry Office", "PUDUCHERRY", "Puducherry Development Center", "Puducherry", "Puducherry", "India"),
            ("Chennai Office", "CHENNAI", "Chennai Tech Park HQ", "Chennai", "Tamil Nadu", "India"),
            ("Bangalore Office", "BANGALORE", "Bangalore Innovation Hub", "Bangalore", "Karnataka", "India")
        ]
        for name, code, addr, city, state, country in locs:
            loc_id = uuid.uuid4().bytes
            cursor.execute("""
                INSERT INTO locations (id, tenant_id, organization_id, name, code, address, city, state, country, timezone, active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'Asia/Kolkata', 1)
            """, (loc_id, tenant, org_id, name, code, addr, city, state, country))
            
        # 7. Designations
        desigs = [
            ("Intern", "INTERN", "Trainees and interns", 1),
            ("Engineer", "ENGINEER", "Software engineers", 2),
            ("Senior Engineer", "SR-ENGINEER", "Senior software engineers", 3),
            ("Lead Engineer", "LEAD-ENGINEER", "Technical lead engineers", 4),
            ("Manager", "MANAGER", "Engineering and product managers", 5)
        ]
        for name, code, desc, lvl in desigs:
            desig_id = uuid.uuid4().bytes
            cursor.execute("""
                INSERT INTO designations (id, tenant_id, organization_id, name, code, level, description, active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 1)
            """, (desig_id, tenant, org_id, name, code, lvl, desc))
            
        # 8. Grades
        grades = ["G1", "G2", "G3", "G4", "G5", "G6"]
        for idx, g in enumerate(grades):
            gr_id = uuid.uuid4().bytes
            cursor.execute("""
                INSERT INTO grades (id, tenant_id, organization_id, name, code, level, active)
                VALUES (%s, %s, %s, %s, %s, %s, 1)
            """, (gr_id, tenant, org_id, g, g, idx + 1))
            
        # 9. Bands
        bands = [
            ("Band A", "BAND-A", 30000.0, 60000.0, "INR"),
            ("Band B", "BAND-B", 60000.0, 120000.0, "INR"),
            ("Band C", "BAND-C", 120000.0, 240000.0, "INR"),
            ("Band D", "BAND-D", 240000.0, 500000.0, "INR")
        ]
        for name, code, min_s, max_s, curr in bands:
            band_id = uuid.uuid4().bytes
            cursor.execute("""
                INSERT INTO bands (id, tenant_id, organization_id, name, code, min_salary, max_salary, currency, active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
            """, (band_id, tenant, org_id, name, code, min_s, max_s, curr))
            
        # 10. Employment Types
        emp_types = [
            ("Full Time", "FT", "Full Time Permanent Employee"),
            ("Contract", "CONTRACT", "Contractor Employee"),
            ("Consultant", "CONSULTANT", "Consultant Partner"),
            ("Intern", "INTERN", "Intern Trainee"),
            ("Part Time", "PT", "Part Time Employee")
        ]
        for name, code, desc in emp_types:
            et_id = uuid.uuid4().bytes
            cursor.execute("""
                INSERT INTO employment_types (id, tenant_id, organization_id, name, code, description, active)
                VALUES (%s, %s, %s, %s, %s, %s, 1)
            """, (et_id, tenant, org_id, name, code, desc))
            
        # 11. Cost Centers
        ccs = [
            ("Engineering Cost Center", "CC-ENG", "Tech and software budget CC"),
            ("Sales Cost Center", "CC-SALES", "Sales and operations CC")
        ]
        for name, code, desc in ccs:
            cc_id = uuid.uuid4().bytes
            cursor.execute("""
                INSERT INTO cost_centers (id, tenant_id, organization_id, name, code, description, active)
                VALUES (%s, %s, %s, %s, %s, %s, 1)
            """, (cc_id, tenant, org_id, name, code, desc))

    conn.commit()
    conn.close()
    print("\nSeeding completed successfully!")

if __name__ == "__main__":
    seed_data()
