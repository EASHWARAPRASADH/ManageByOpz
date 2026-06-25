import mysql.connector
import uuid
import datetime

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )

def to_bin(uuid_str):
    if not uuid_str:
        return None
    return uuid.UUID(uuid_str).bytes

def seed():
    conn = get_connection()
    cursor = conn.cursor()
    
    tenant = 'ACME'
    print(f"Starting seed process for tenant '{tenant}'...")

    # Define all constant IDs (using string representations)
    org_id = '6841af62-9c16-431b-a8c2-a3adba1dc47a'
    
    bu_ids = {
        'TECH': '10000000-0000-0000-0000-000000000001',
        'HR': '10000000-0000-0000-0000-000000000002',
        'FIN': '10000000-0000-0000-0000-000000000003',
        'SALES': '10000000-0000-0000-0000-000000000004',
        'OPS': '10000000-0000-0000-0000-000000000005'
    }

    div_ids = {
        'TECH-PE': '20000000-0000-0000-0000-000000000001',
        'TECH-AE': '20000000-0000-0000-0000-000000000002',
        'TECH-INF': '20000000-0000-0000-0000-000000000003',
        'HR-TA': '20000000-0000-0000-0000-000000000004',
        'HR-ES': '20000000-0000-0000-0000-000000000005',
        'FIN-ACC': '20000000-0000-0000-0000-000000000006',
        'FIN-PAY': '20000000-0000-0000-0000-000000000007',
        'SALES-ENT': '20000000-0000-0000-0000-000000000008',
        'SALES-INS': '20000000-0000-0000-0000-000000000009'
    }

    dept_ids = {
        'FE': '30000000-0000-0000-0000-000000000001',
        'BE': '30000000-0000-0000-0000-000000000002',
        'QA': '30000000-0000-0000-0000-000000000003',
        'DEVOPS': '30000000-0000-0000-0000-000000000004',
        'WEB': '30000000-0000-0000-0000-000000000005',
        'MOBILE': '30000000-0000-0000-0000-000000000006',
        'REC': '30000000-0000-0000-0000-000000000007',
        'TRN': '30000000-0000-0000-0000-000000000008',
        'ACC': '30000000-0000-0000-0000-000000000009',
        'PAY': '30000000-0000-0000-0000-000000000010'
    }

    team_ids = {
        'FE-REACT': '40000000-0000-0000-0000-000000000001',
        'FE-ANG': '40000000-0000-0000-0000-000000000002',
        'BE-SPRING': '40000000-0000-0000-0000-000000000003',
        'BE-MICRO': '40000000-0000-0000-0000-000000000004',
        'DEV-CLOUD': '40000000-0000-0000-0000-000000000005',
        'DEV-PLAT': '40000000-0000-0000-0000-000000000006'
    }

    loc_ids = {
        'PDY': '50000000-0000-0000-0000-000000000001',
        'CHE': '50000000-0000-0000-0000-000000000002',
        'BLR': '50000000-0000-0000-0000-000000000003',
        'HYD': '50000000-0000-0000-0000-000000000004',
        'MUM': '50000000-0000-0000-0000-000000000005',
        'REMOTE': '50000000-0000-0000-0000-000000000006'
    }

    desig_ids = {
        'Intern': '60000000-0000-0000-0000-000000000001',
        'Associate Engineer': '60000000-0000-0000-0000-000000000002',
        'Software Engineer': '60000000-0000-0000-0000-000000000003',
        'Senior Software Engineer': '60000000-0000-0000-0000-000000000004',
        'Staff Engineer': '60000000-0000-0000-0000-000000000005',
        'Lead Engineer': '60000000-0000-0000-0000-000000000006',
        'Engineering Manager': '60000000-0000-0000-0000-000000000007',
        'Director Engineering': '60000000-0000-0000-0000-000000000008',
        'VP Engineering': '60000000-0000-0000-0000-000000000009',
        'HR Executive': '60000000-0000-0000-0000-000000000010',
        'HR Manager': '60000000-0000-0000-0000-000000000011',
        'Finance Executive': '60000000-0000-0000-0000-000000000012',
        'Finance Manager': '60000000-0000-0000-0000-000000000013'
    }

    grade_ids = {
        'G1': '70000000-0000-0000-0000-000000000001',
        'G2': '70000000-0000-0000-0000-000000000002',
        'G3': '70000000-0000-0000-0000-000000000003',
        'G4': '70000000-0000-0000-0000-000000000004',
        'G5': '70000000-0000-0000-0000-000000000005',
        'G6': '70000000-0000-0000-0000-000000000006',
        'G7': '70000000-0000-0000-0000-000000000007',
        'G8': '70000000-0000-0000-0000-000000000008'
    }

    band_ids = {
        'Band A': '80000000-0000-0000-0000-000000000001',
        'Band B': '80000000-0000-0000-0000-000000000002',
        'Band C': '80000000-0000-0000-0000-000000000003',
        'Band D': '80000000-0000-0000-0000-000000000004',
        'Band E': '80000000-0000-0000-0000-000000000005'
    }

    emp_type_ids = {
        'Permanent': '90000000-0000-0000-0000-000000000001',
        'Contract': '90000000-0000-0000-0000-000000000002',
        'Intern': '90000000-0000-0000-0000-000000000003',
        'Consultant': '90000000-0000-0000-0000-000000000004',
        'Part Time': '90000000-0000-0000-0000-000000000005'
    }

    cc_ids = {
        'CC-TECH': 'a0000000-0000-0000-0000-000000000001',
        'CC-HR': 'a0000000-0000-0000-0000-000000000002',
        'CC-FIN': 'a0000000-0000-0000-0000-000000000003',
        'CC-SALES': 'a0000000-0000-0000-0000-000000000004',
        'CC-OPS': 'a0000000-0000-0000-0000-000000000005'
    }

    employee_ids = {
        'ACME-000001': 'b0000000-0000-0000-0000-000000000001',
        'ACME-000002': 'b0000000-0000-0000-0000-000000000002',
        'ACME-000003': 'b0000000-0000-0000-0000-000000000003',
        'ACME-000004': 'b0000000-0000-0000-0000-000000000004',
        'ACME-000005': 'b0000000-0000-0000-0000-000000000005',
        'ACME-000006': 'b0000000-0000-0000-0000-000000000006',
        'ACME-000007': 'b0000000-0000-0000-0000-000000000007'
    }

    leave_type_ids = {
        'CL': 'c0000000-0000-0000-0000-000000000001',
        'SL': 'c0000000-0000-0000-0000-000000000002',
        'EL': 'c0000000-0000-0000-0000-000000000003',
        'ML': 'c0000000-0000-0000-0000-000000000004',
        'PL': 'c0000000-0000-0000-0000-000000000005',
        'LOP': 'c0000000-0000-0000-0000-000000000006'
    }

    policy_id = 'd0000000-0000-0000-0000-000000000001'

    # --- 1. CLEANUP PREVIOUS DATA FOR TENANT ACME ---
    print("Performing database cleanup...")
    
    # Temporarily disable foreign keys
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    
    # 1. Clear conflicting employee twins globally (across all tenants) to avoid unique constraint violations
    cursor.execute("DELETE FROM employee_twins WHERE employee_code LIKE 'ACME-%' OR work_email LIKE '%%@acme.com' OR tenant_id = %s", (tenant,))
    print("Cleared conflicting employee twins globally")
    
    # 2. Clear conflicting users globally (except key admins)
    cursor.execute("""
        DELETE FROM user_roles 
        WHERE user_id IN (
            SELECT id FROM users 
            WHERE (username LIKE 'acme-%%' OR email LIKE '%%@acme.com' OR tenant_id = %s)
            AND email NOT IN ('super.admin@managemyopz.com', 'admin@managemyopz.com', 'employee@managemyopz.com')
        )
    """, (tenant,))
    
    cursor.execute("""
        DELETE FROM users 
        WHERE (username LIKE 'acme-%%' OR email LIKE '%%@acme.com' OR tenant_id = %s)
        AND email NOT IN ('super.admin@managemyopz.com', 'admin@managemyopz.com', 'employee@managemyopz.com')
    """, (tenant,))
    print("Cleared conflicting user accounts globally")
    
    # 3. Clear other tables for tenant ACME
    cleanup_tables = [
        "leave_requests", "leave_balances", "recognitions", 
        "approval_matrix_levels", "approval_matrices", 
        "employee_skills", "employee_certifications", "employee_documents", 
        "employee_relationships", "employee_timeline", "employee_custom_fields", 
        "positions", "cost_centers", "employment_types", 
        "bands", "grades", "designations", "locations", "sub_departments", 
        "departments", "divisions", "business_units", "leave_policy_assignments", 
        "leave_policy_rules", "leave_policies", "leave_types", 
        "holiday_calendar_days", "holiday_calendars", "employee_code_sequences", "organizations"
    ]
    
    for tbl in cleanup_tables:
        cursor.execute(f"DELETE FROM {tbl} WHERE tenant_id = %s", (tenant,))
        print(f"Cleared table: {tbl}")

    # Enable foreign keys
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    print("Cleanup finished successfully!")

    # --- 2. SEED ORGANIZATIONS ---
    print("\nSeeding Organization...")
    cursor.execute("""
        INSERT INTO organizations (
            id, tenant_id, name, code, legal_name, country, currency, timezone, active, 
            employee_code_prefix, sequence_length, starting_sequence_number, employee_code_pattern, primary_email
        ) VALUES (
            %s, %s, 'Acme Corporation', 'ACME', 'Acme Corporation Ltd', 'India', 'INR', 'Asia/Kolkata', 1,
            'ACME-', 6, 1, 'ACME-{SEQ:6}', 'info@acme.com'
        )
    """, (to_bin(org_id), tenant))

    # --- 3. SEED BUSINESS UNITS ---
    print("Seeding Business Units...")
    bus = [
        ('Technology', 'TECH', 'Technology Business Unit'),
        ('Human Resources', 'HR', 'Human Resources Business Unit'),
        ('Finance', 'FIN', 'Finance and Accounts Business Unit'),
        ('Sales', 'SALES', 'Global Sales Business Unit'),
        ('Operations', 'OPS', 'Operations Business Unit')
    ]
    for name, code, desc in bus:
        cursor.execute("""
            INSERT INTO business_units (id, tenant_id, organization_id, name, code, description, active)
            VALUES (%s, %s, %s, %s, %s, %s, 1)
        """, (to_bin(bu_ids[code]), tenant, to_bin(org_id), name, code, desc))

    # --- 4. SEED DIVISIONS ---
    print("Seeding Divisions...")
    divs = [
        ('Platform Engineering', 'TECH-PE', 'TECH', 'Core Platform Team'),
        ('Application Engineering', 'TECH-AE', 'TECH', 'Product Teams'),
        ('Infrastructure', 'TECH-INF', 'TECH', 'Cloud and Infrastructure'),
        ('Talent Acquisition', 'HR-TA', 'HR', 'Recruitment and Onboarding'),
        ('Employee Success', 'HR-ES', 'HR', 'Training and Support'),
        ('Accounts', 'FIN-ACC', 'FIN', 'General Ledger & Accounts'),
        ('Payroll', 'FIN-PAY', 'FIN', 'Payroll & Disbursements'),
        ('Enterprise Sales', 'SALES-ENT', 'SALES', 'B2B Large Accounts'),
        ('Inside Sales', 'SALES-INS', 'SALES', 'B2B SMB Accounts')
    ]
    for name, code, bu_code, desc in divs:
        cursor.execute("""
            INSERT INTO divisions (id, tenant_id, business_unit_id, name, code, description, active)
            VALUES (%s, %s, %s, %s, %s, %s, 1)
        """, (to_bin(div_ids[code]), tenant, to_bin(bu_ids[bu_code]), name, code, desc))

    # --- 5. SEED DEPARTMENTS ---
    print("Seeding Departments...")
    depts = [
        ('Frontend Engineering', 'FE', 'TECH-PE', 'Frontend Web/Mobile Dev'),
        ('Backend Engineering', 'BE', 'TECH-PE', 'Core Backend Services'),
        ('QA Testing', 'QA', 'TECH-PE', 'Quality Assurance & Testing'),
        ('DevOps', 'DEVOPS', 'TECH-PE', 'CI/CD and Site Reliability'),
        ('Web Applications', 'WEB', 'TECH-AE', 'Web Products Dev'),
        ('Mobile Applications', 'MOBILE', 'TECH-AE', 'iOS and Android Apps'),
        ('Recruitment', 'REC', 'HR-TA', 'End to End Hiring'),
        ('Training', 'TRN', 'HR-ES', 'Learning and Development'),
        ('Accounting', 'ACC', 'FIN-ACC', 'Financial bookkeeping'),
        ('Payroll Operations', 'PAY', 'FIN-PAY', 'Payroll operations')
    ]
    for name, code, div_code, desc in depts:
        cursor.execute("""
            INSERT INTO departments (id, tenant_id, division_id, name, code, description, active)
            VALUES (%s, %s, %s, %s, %s, %s, 1)
        """, (to_bin(dept_ids[code]), tenant, to_bin(div_ids[div_code]), name, code, desc))

    # --- 6. SEED TEAMS (SUB DEPARTMENTS) ---
    print("Seeding Teams...")
    sub_depts = [
        ('React Team', 'FE-REACT', 'FE', 'React Core Engineering'),
        ('Angular Team', 'FE-ANG', 'FE', 'Angular Engineering'),
        ('Spring Boot Team', 'BE-SPRING', 'BE', 'Spring Boot Core Services'),
        ('Microservices Team', 'BE-MICRO', 'BE', 'Microservices Engineering'),
        ('Cloud Team', 'DEV-CLOUD', 'DEVOPS', 'Cloud Infrastructure DevOps'),
        ('Platform Team', 'DEV-PLAT', 'DEVOPS', 'Internal Developer Platform')
    ]
    for name, code, dept_code, desc in sub_depts:
        cursor.execute("""
            INSERT INTO sub_departments (id, tenant_id, department_id, name, code, description, active)
            VALUES (%s, %s, %s, %s, %s, %s, 1)
        """, (to_bin(team_ids[code]), tenant, to_bin(dept_ids[dept_code]), name, code, desc))

    # --- 7. SEED LOCATIONS ---
    print("Seeding Locations...")
    locs = [
        ('Puducherry Office', 'PDY', 'Puducherry', 'Puducherry', 'India'),
        ('Chennai Office', 'CHE', 'Chennai', 'Tamil Nadu', 'India'),
        ('Bangalore Office', 'BLR', 'Bangalore', 'Karnataka', 'India'),
        ('Hyderabad Office', 'HYD', 'Hyderabad', 'Telangana', 'India'),
        ('Mumbai Office', 'MUM', 'Mumbai', 'Maharashtra', 'India'),
        ('Remote Work', 'REMOTE', 'Remote', 'Remote', 'Global')
    ]
    for name, code, city, state, country in locs:
        cursor.execute("""
            INSERT INTO locations (id, tenant_id, organization_id, name, code, address, city, state, country, timezone, active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'Asia/Kolkata', 1)
        """, (to_bin(loc_ids[code]), tenant, to_bin(org_id), name, code, f"{city} Tech Center", city, state, country))

    # --- 8. SEED DESIGNATIONS ---
    print("Seeding Designations...")
    desigs = [
        ('Intern', 'INTERN', 1),
        ('Associate Engineer', 'ASSOC_ENG', 2),
        ('Software Engineer', 'SW_ENG', 3),
        ('Senior Software Engineer', 'SR_SW_ENG', 4),
        ('Staff Engineer', 'STAFF_ENG', 5),
        ('Lead Engineer', 'LEAD_ENG', 6),
        ('Engineering Manager', 'ENG_MGR', 7),
        ('Director Engineering', 'DIR_ENG', 8),
        ('VP Engineering', 'VP_ENG', 9),
        ('HR Executive', 'HR_EXEC', 3),
        ('HR Manager', 'HR_MGR', 6),
        ('Finance Executive', 'FIN_EXEC', 3),
        ('Finance Manager', 'FIN_MGR', 6)
    ]
    for name, code, lvl in desigs:
        cursor.execute("""
            INSERT INTO designations (id, tenant_id, organization_id, name, code, level, description, active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 1)
        """, (to_bin(desig_ids[name]), tenant, to_bin(org_id), name, code, lvl, f"{name} designation"))

    # --- 9. SEED GRADES ---
    print("Seeding Grades...")
    for g in ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8']:
        lvl = int(g[1])
        cursor.execute("""
            INSERT INTO grades (id, tenant_id, organization_id, name, code, level, active)
            VALUES (%s, %s, %s, %s, %s, %s, 1)
        """, (to_bin(grade_ids[g]), tenant, to_bin(org_id), g, g, lvl))

    # --- 10. SEED BANDS ---
    print("Seeding Bands...")
    bands = [
        ('Band A', 30000.0, 60000.0),
        ('Band B', 60000.0, 120000.0),
        ('Band C', 120000.0, 240000.0),
        ('Band D', 240000.0, 500000.0),
        ('Band E', 500000.0, 1000000.0)
    ]
    for name, min_s, max_s in bands:
        cursor.execute("""
            INSERT INTO bands (id, tenant_id, organization_id, name, code, min_salary, max_salary, currency, active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'INR', 1)
        """, (to_bin(band_ids[name]), tenant, to_bin(org_id), name, name.upper().replace(' ', '_'), min_s, max_s))

    # --- 11. SEED EMPLOYMENT TYPES ---
    print("Seeding Employment Types...")
    emp_types = [
        ('Permanent', 'PERM'),
        ('Contract', 'CONTRACT'),
        ('Intern', 'INTERN'),
        ('Consultant', 'CONSULTANT'),
        ('Part Time', 'PART_TIME')
    ]
    for name, code in emp_types:
        cursor.execute("""
            INSERT INTO employment_types (id, tenant_id, organization_id, name, code, description, active)
            VALUES (%s, %s, %s, %s, %s, %s, 1)
        """, (to_bin(emp_type_ids[name]), tenant, to_bin(org_id), name, code, f"{name} employment status"))

    # --- 12. SEED COST CENTERS ---
    print("Seeding Cost Centers...")
    for code in ['CC-TECH', 'CC-HR', 'CC-FIN', 'CC-SALES', 'CC-OPS']:
        cursor.execute("""
            INSERT INTO cost_centers (id, tenant_id, organization_id, name, code, description, active)
            VALUES (%s, %s, %s, %s, %s, %s, 1)
        """, (to_bin(cc_ids[code]), tenant, to_bin(org_id), f"{code[3:]} CC", code, f"Cost Center for {code[3:]}"))

    # --- 13. SEED LEAVE TYPES & POLICIES ---
    print("Seeding Leave Types & Policies...")
    cursor.execute("""
        INSERT INTO leave_policies (id, tenant_id, policy_name, policy_code, description, effective_from, active)
        VALUES (%s, %s, 'Acme Leave Policy', 'ACME_POLICY', 'Standard Corporate leave policy', '2026-01-01', 1)
    """, (to_bin(policy_id), tenant))

    leave_types = [
        ('Casual Leave', 'CL', 12.0),
        ('Sick Leave', 'SL', 12.0),
        ('Earned Leave', 'EL', 18.0),
        ('Maternity Leave', 'ML', 180.0),
        ('Paternity Leave', 'PL', 15.0),
        ('Loss Of Pay', 'LOP', 0.0)
    ]
    for name, code, days in leave_types:
        lt_id = leave_type_ids[code]
        # Insert leave type
        cursor.execute("""
            INSERT INTO leave_types (
                id, tenant_id, name, code, description, default_days, carry_forward_allowed, 
                max_carry_forward_days, encashment_allowed, half_day_allowed, negative_balance_allowed, 
                requires_approval, active, leave_policy_id
            ) VALUES (%s, %s, %s, %s, %s, %s, 1, 5, 0, 1, 0, 1, 1, %s)
        """, (to_bin(lt_id), tenant, name, code, f"{name} type", days, to_bin(policy_id)))

        # Insert leave policy rule
        cursor.execute("""
            INSERT INTO leave_policy_rules (
                id, tenant_id, policy_id, leave_type_id, allocated_days, accrual_method, 
                carry_forward_limit, encashment_allowed, negative_balance_allowed
            ) VALUES (%s, %s, %s, %s, %s, 'YEARLY', 5, 0, 0)
        """, (uuid.uuid4().bytes, tenant, to_bin(policy_id), to_bin(lt_id), days))

    # Assign policy to Acme Organization
    cursor.execute("""
        INSERT INTO leave_policy_assignments (id, tenant_id, policy_id, organization_id)
        VALUES (%s, %s, %s, %s)
    """, (uuid.uuid4().bytes, tenant, to_bin(policy_id), to_bin(org_id)))

    # --- 14. SEED SAMPLE EMPLOYEES ---
    print("Seeding Employees...")
    
    # 1. Robert Johnson (CEO / VP Engineering)
    # ACME-000001
    cursor.execute("""
        INSERT INTO employee_twins (
            id, tenant_id, employee_code, first_name, last_name, display_name,
            work_email, gender, date_of_birth, date_of_joining, employment_status,
            organization_id, business_unit_id, division_id, department_id,
            designation_id, location_id, grade_id, band_id, cost_center_id, employment_type_id
        ) VALUES (
            %s, %s, 'ACME-000001', 'Robert', 'Johnson', 'Robert Johnson',
            'robert.johnson@acme.com', 'MALE', '1975-08-12', '2020-01-01', 'ACTIVE',
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
    """, (
        to_bin(employee_ids['ACME-000001']), tenant,
        to_bin(org_id), to_bin(bu_ids['TECH']), to_bin(div_ids['TECH-PE']), to_bin(dept_ids['FE']),
        to_bin(desig_ids['VP Engineering']), to_bin(loc_ids['CHE']), to_bin(grade_ids['G8']), to_bin(band_ids['Band E']),
        to_bin(cc_ids['CC-TECH']), to_bin(emp_type_ids['Permanent'])
    ))

    # 2. Michael Chen (Director Engineering)
    # ACME-000002
    cursor.execute("""
        INSERT INTO employee_twins (
            id, tenant_id, employee_code, first_name, last_name, display_name,
            work_email, gender, date_of_birth, date_of_joining, employment_status, manager_id,
            organization_id, business_unit_id, division_id, department_id,
            designation_id, location_id, grade_id, band_id, cost_center_id, employment_type_id
        ) VALUES (
            %s, %s, 'ACME-000002', 'Michael', 'Chen', 'Michael Chen',
            'michael.chen@acme.com', 'MALE', '1980-04-20', '2021-03-15', 'ACTIVE', %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
    """, (
        to_bin(employee_ids['ACME-000002']), tenant, to_bin(employee_ids['ACME-000001']),
        to_bin(org_id), to_bin(bu_ids['TECH']), to_bin(div_ids['TECH-PE']), to_bin(dept_ids['FE']),
        to_bin(desig_ids['Director Engineering']), to_bin(loc_ids['CHE']), to_bin(grade_ids['G7']), to_bin(band_ids['Band E']),
        to_bin(cc_ids['CC-TECH']), to_bin(emp_type_ids['Permanent'])
    ))

    # 3. Sarah Williams (Engineering Manager)
    # ACME-000003
    cursor.execute("""
        INSERT INTO employee_twins (
            id, tenant_id, employee_code, first_name, last_name, display_name,
            work_email, gender, date_of_birth, date_of_joining, employment_status, manager_id,
            organization_id, business_unit_id, division_id, department_id,
            designation_id, location_id, grade_id, band_id, cost_center_id, employment_type_id
        ) VALUES (
            %s, %s, 'ACME-000003', 'Sarah', 'Williams', 'Sarah Williams',
            'sarah.williams@acme.com', 'FEMALE', '1985-09-05', '2022-05-10', 'ACTIVE', %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
    """, (
        to_bin(employee_ids['ACME-000003']), tenant, to_bin(employee_ids['ACME-000002']),
        to_bin(org_id), to_bin(bu_ids['TECH']), to_bin(div_ids['TECH-PE']), to_bin(dept_ids['FE']),
        to_bin(desig_ids['Engineering Manager']), to_bin(loc_ids['CHE']), to_bin(grade_ids['G6']), to_bin(band_ids['Band D']),
        to_bin(cc_ids['CC-TECH']), to_bin(emp_type_ids['Permanent'])
    ))

    # 4. Dhipak Sankar (Staff Engineer)
    # ACME-000004
    cursor.execute("""
        INSERT INTO employee_twins (
            id, tenant_id, employee_code, first_name, last_name, display_name,
            work_email, gender, date_of_birth, date_of_joining, employment_status, manager_id,
            organization_id, business_unit_id, division_id, department_id, sub_department_id,
            designation_id, location_id, grade_id, band_id, cost_center_id, employment_type_id
        ) VALUES (
            %s, %s, 'ACME-000004', 'Dhipak', 'Sankar', 'Dhipak Sankar',
            'dhipak.sankar@acme.com', 'MALE', '1990-11-22', '2023-01-15', 'ACTIVE', %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
    """, (
        to_bin(employee_ids['ACME-000004']), tenant, to_bin(employee_ids['ACME-000003']),
        to_bin(org_id), to_bin(bu_ids['TECH']), to_bin(div_ids['TECH-PE']), to_bin(dept_ids['BE']), to_bin(team_ids['BE-SPRING']),
        to_bin(desig_ids['Staff Engineer']), to_bin(loc_ids['CHE']), to_bin(grade_ids['G5']), to_bin(band_ids['Band C']),
        to_bin(cc_ids['CC-TECH']), to_bin(emp_type_ids['Permanent'])
    ))

    # 5. Arpit Sharma (Senior Engineer)
    # ACME-000005
    cursor.execute("""
        INSERT INTO employee_twins (
            id, tenant_id, employee_code, first_name, last_name, display_name,
            work_email, gender, date_of_birth, date_of_joining, employment_status, manager_id,
            organization_id, business_unit_id, division_id, department_id,
            designation_id, location_id, grade_id, band_id, cost_center_id, employment_type_id
        ) VALUES (
            %s, %s, 'ACME-000005', 'Arpit', 'Sharma', 'Arpit Sharma',
            'arpit.sharma@acme.com', 'MALE', '1992-06-18', '2023-08-01', 'ACTIVE', %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
    """, (
        to_bin(employee_ids['ACME-000005']), tenant, to_bin(employee_ids['ACME-000003']),
        to_bin(org_id), to_bin(bu_ids['TECH']), to_bin(div_ids['TECH-PE']), to_bin(dept_ids['BE']),
        to_bin(desig_ids['Senior Software Engineer']), to_bin(loc_ids['CHE']), to_bin(grade_ids['G4']), to_bin(band_ids['Band B']),
        to_bin(cc_ids['CC-TECH']), to_bin(emp_type_ids['Permanent'])
    ))

    # 6. Priya Nair (HR Manager)
    # ACME-000006
    cursor.execute("""
        INSERT INTO employee_twins (
            id, tenant_id, employee_code, first_name, last_name, display_name,
            work_email, gender, date_of_birth, date_of_joining, employment_status, manager_id,
            organization_id, business_unit_id, division_id, department_id,
            designation_id, location_id, grade_id, band_id, cost_center_id, employment_type_id
        ) VALUES (
            %s, %s, 'ACME-000006', 'Priya', 'Nair', 'Priya Nair',
            'priya.nair@acme.com', 'FEMALE', '1987-02-14', '2021-09-01', 'ACTIVE', %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
    """, (
        to_bin(employee_ids['ACME-000006']), tenant, to_bin(employee_ids['ACME-000001']),
        to_bin(org_id), to_bin(bu_ids['HR']), to_bin(div_ids['HR-TA']), to_bin(dept_ids['REC']),
        to_bin(desig_ids['HR Manager']), to_bin(loc_ids['CHE']), to_bin(grade_ids['G6']), to_bin(band_ids['Band C']),
        to_bin(cc_ids['CC-HR']), to_bin(emp_type_ids['Permanent'])
    ))

    # 7. Rahul Gupta (Finance Manager)
    # ACME-000007
    cursor.execute("""
        INSERT INTO employee_twins (
            id, tenant_id, employee_code, first_name, last_name, display_name,
            work_email, gender, date_of_birth, date_of_joining, employment_status, manager_id,
            organization_id, business_unit_id, division_id, department_id,
            designation_id, location_id, grade_id, band_id, cost_center_id, employment_type_id
        ) VALUES (
            %s, %s, 'ACME-000007', 'Rahul', 'Gupta', 'Rahul Gupta',
            'rahul.gupta@acme.com', 'MALE', '1986-12-05', '2020-07-15', 'ACTIVE', %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
    """, (
        to_bin(employee_ids['ACME-000007']), tenant, to_bin(employee_ids['ACME-000001']),
        to_bin(org_id), to_bin(bu_ids['FIN']), to_bin(div_ids['FIN-ACC']), to_bin(dept_ids['ACC']),
        to_bin(desig_ids['Finance Manager']), to_bin(loc_ids['CHE']), to_bin(grade_ids['G6']), to_bin(band_ids['Band C']),
        to_bin(cc_ids['CC-FIN']), to_bin(emp_type_ids['Permanent'])
    ))

    # --- 15. SEED LEAVE WALLETS (LEAVE BALANCES) ---
    print("Seeding Employee Leave Balances for 2026...")
    leave_allocations = {
        'CL': 12.0,
        'SL': 12.0,
        'EL': 18.0,
        'ML': 180.0,
        'PL': 15.0,
        'LOP': 0.0
    }
    for emp_code, emp_uuid in employee_ids.items():
        for lt_code, lt_uuid in leave_type_ids.items():
            days = leave_allocations[lt_code]
            cursor.execute("""
                INSERT INTO leave_balances (
                    id, tenant_id, employee_id, leave_type_id, year, 
                    total_allocated, total_used, total_pending, carried_forward, balance
                ) VALUES (%s, %s, %s, %s, 2026, %s, 0.0, 0.0, 0.0, %s)
            """, (uuid.uuid4().bytes, tenant, to_bin(emp_uuid), to_bin(lt_uuid), days, days))

    # --- 16. SEED APPROVAL MATRICES ---
    print("Seeding Approval Matrices...")
    
    # Engineering matrix: Backend Engineering
    eng_matrix_id = 'e0000000-0000-0000-0000-000000000001'
    cursor.execute("""
        INSERT INTO approval_matrices (
            id, tenant_id, department_id, approval_type, 
            approver_level1_id, approver_level1_type, 
            approver_level2_id, approver_level2_type, active
        ) VALUES (%s, %s, %s, 'LEAVE', %s, 'SPECIFIC_USER', %s, 'SPECIFIC_USER', 1)
    """, (
        to_bin(eng_matrix_id), tenant, to_bin(dept_ids['BE']),
        to_bin(employee_ids['ACME-000003']), # Level 1: Sarah Williams
        to_bin(employee_ids['ACME-000002'])  # Level 2: Michael Chen
    ))
    
    # Engineering matrix levels
    cursor.execute("""
        INSERT INTO approval_matrix_levels (
            id, tenant_id, matrix_id, level_number, approver_type, approver_employee_id, required, allow_skip, deleted, created_at, created_by, version
        ) VALUES (%s, %s, %s, 1, 'SPECIFIC_USER', %s, 1, 0, 0, NOW(), 'system', 0)
    """, (uuid.uuid4().bytes, tenant, to_bin(eng_matrix_id), to_bin(employee_ids['ACME-000003'])))
    cursor.execute("""
        INSERT INTO approval_matrix_levels (
            id, tenant_id, matrix_id, level_number, approver_type, approver_employee_id, required, allow_skip, deleted, created_at, created_by, version
        ) VALUES (%s, %s, %s, 2, 'SPECIFIC_USER', %s, 1, 0, 0, NOW(), 'system', 0)
    """, (uuid.uuid4().bytes, tenant, to_bin(eng_matrix_id), to_bin(employee_ids['ACME-000002'])))

    # HR matrix: Recruitment
    hr_matrix_id = 'e0000000-0000-0000-0000-000000000002'
    cursor.execute("""
        INSERT INTO approval_matrices (
            id, tenant_id, department_id, approval_type, 
            approver_level1_id, approver_level1_type, 
            approver_level2_id, approver_level2_type, active
        ) VALUES (%s, %s, %s, 'LEAVE', %s, 'SPECIFIC_USER', %s, 'SPECIFIC_USER', 1)
    """, (
        to_bin(hr_matrix_id), tenant, to_bin(dept_ids['REC']),
        to_bin(employee_ids['ACME-000006']), # Level 1: Priya Nair
        to_bin(employee_ids['ACME-000001'])  # Level 2: Robert Johnson
    ))
    
    # HR matrix levels
    cursor.execute("""
        INSERT INTO approval_matrix_levels (
            id, tenant_id, matrix_id, level_number, approver_type, approver_employee_id, required, allow_skip, deleted, created_at, created_by, version
        ) VALUES (%s, %s, %s, 1, 'SPECIFIC_USER', %s, 1, 0, 0, NOW(), 'system', 0)
    """, (uuid.uuid4().bytes, tenant, to_bin(hr_matrix_id), to_bin(employee_ids['ACME-000006'])))
    cursor.execute("""
        INSERT INTO approval_matrix_levels (
            id, tenant_id, matrix_id, level_number, approver_type, approver_employee_id, required, allow_skip, deleted, created_at, created_by, version
        ) VALUES (%s, %s, %s, 2, 'SPECIFIC_USER', %s, 1, 0, 0, NOW(), 'system', 0)
    """, (uuid.uuid4().bytes, tenant, to_bin(hr_matrix_id), to_bin(employee_ids['ACME-000001'])))

    # Finance matrix: Accounting
    fin_matrix_id = 'e0000000-0000-0000-0000-000000000003'
    cursor.execute("""
        INSERT INTO approval_matrices (
            id, tenant_id, department_id, approval_type, 
            approver_level1_id, approver_level1_type, 
            approver_level2_id, approver_level2_type, active
        ) VALUES (%s, %s, %s, 'LEAVE', %s, 'SPECIFIC_USER', %s, 'SPECIFIC_USER', 1)
    """, (
        to_bin(fin_matrix_id), tenant, to_bin(dept_ids['ACC']),
        to_bin(employee_ids['ACME-000007']), # Level 1: Rahul Gupta
        to_bin(employee_ids['ACME-000001'])  # Level 2: Robert Johnson
    ))
    
    # Finance matrix levels
    cursor.execute("""
        INSERT INTO approval_matrix_levels (
            id, tenant_id, matrix_id, level_number, approver_type, approver_employee_id, required, allow_skip, deleted, created_at, created_by, version
        ) VALUES (%s, %s, %s, 1, 'SPECIFIC_USER', %s, 1, 0, 0, NOW(), 'system', 0)
    """, (uuid.uuid4().bytes, tenant, to_bin(fin_matrix_id), to_bin(employee_ids['ACME-000007'])))
    cursor.execute("""
        INSERT INTO approval_matrix_levels (
            id, tenant_id, matrix_id, level_number, approver_type, approver_employee_id, required, allow_skip, deleted, created_at, created_by, version
        ) VALUES (%s, %s, %s, 2, 'SPECIFIC_USER', %s, 1, 0, 0, NOW(), 'system', 0)
    """, (uuid.uuid4().bytes, tenant, to_bin(fin_matrix_id), to_bin(employee_ids['ACME-000001'])))

    # --- 17. UPDATE ADMINISTRATIVE USER ACCOUNTS ---
    print("Updating Admin and Employee User Accounts...")
    
    # Ensure default users exist in users table
    default_users = [
        ('00000000-0000-0000-0000-000000000002', 'super.admin@managemyopz.com', 'super.admin@managemyopz.com', 'ROLE_SUPER_ADMIN'),
        ('00000000-0000-0000-0000-000000000003', 'admin@managemyopz.com', 'admin@managemyopz.com', 'ROLE_ADMIN'),
        ('00000000-0000-0000-0000-000000000004', 'employee@managemyopz.com', 'employee@managemyopz.com', 'ROLE_EMPLOYEE')
    ]
    bcrypt_hash = '$2b$10$SO7mGXLqrhDS/rEwAVMZZOFM1lbGKMD9omQGkF1kSRAU/mJpDyOei' # Admin@123
    
    for u_uuid_str, username, email, role_code in default_users:
        u_bin = to_bin(u_uuid_str)
        # Check if username or email exists
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s OR id = %s", (username, email, u_bin))
        row = cursor.fetchone()
        if not row:
            # Insert user
            cursor.execute("""
                INSERT INTO users (id, tenant_id, username, email, password_hash, first_name, last_name, employee_id, active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NULL, 1)
            """, (u_bin, tenant, username, email, bcrypt_hash, 'Default', 'User'))
            
            # Find role ID
            cursor.execute("SELECT id FROM roles WHERE code = %s AND tenant_id = %s", (role_code, tenant))
            role_row = cursor.fetchone()
            if role_row:
                role_bin = role_row[0]
            else:
                cursor.execute("SELECT id FROM roles WHERE code = %s", (role_code,))
                role_bin = cursor.fetchone()[0]
                
            cursor.execute("""
                INSERT INTO user_roles (user_id, role_id)
                VALUES (%s, %s)
            """, (u_bin, role_bin))
            print(f"Recreated default user: {username}")
        else:
            # If the user was soft-deleted, active=0 or deleted=1, let's restore it
            cursor.execute("""
                UPDATE users 
                SET active = 1, deleted = 0 
                WHERE id = %s
            """, (row[0],))

    # Map super.admin to Robert Johnson
    cursor.execute("""
        UPDATE users 
        SET employee_id = %s, first_name = 'Robert', last_name = 'Johnson', email = 'robert.johnson@acme.com', username = 'super.admin@managemyopz.com'
        WHERE (username = 'super.admin@managemyopz.com' OR email = 'robert.johnson@acme.com' OR id = %s) AND tenant_id = %s
    """, (employee_ids['ACME-000001'], to_bin('00000000-0000-0000-0000-000000000002'), tenant))
    
    # Map admin to Sarah Williams
    cursor.execute("""
        UPDATE users 
        SET employee_id = %s, first_name = 'Sarah', last_name = 'Williams', email = 'sarah.williams@acme.com', username = 'admin@managemyopz.com'
        WHERE (username = 'admin@managemyopz.com' OR email = 'sarah.williams@acme.com' OR id = %s) AND tenant_id = %s
    """, (employee_ids['ACME-000003'], to_bin('00000000-0000-0000-0000-000000000003'), tenant))
    
    # Map employee to Dhipak Sankar
    cursor.execute("""
        UPDATE users 
        SET employee_id = %s, first_name = 'Dhipak', last_name = 'Sankar', email = 'dhipak.sankar@acme.com', username = 'employee@managemyopz.com'
        WHERE (username = 'employee@managemyopz.com' OR email = 'dhipak.sankar@acme.com' OR id = %s) AND tenant_id = %s
    """, (employee_ids['ACME-000004'], to_bin('00000000-0000-0000-0000-000000000004'), tenant))

    # --- 18. SEED NEW USER ACCOUNTS FOR OTHERS ---
    print("Creating User Accounts for other employees...")
    
    other_users = [
        ('acme-000002', 'michael.chen@acme.com', 'Michael', 'Chen', 'ACME-000002', 'ROLE_ADMIN'),
        ('acme-000005', 'arpit.sharma@acme.com', 'Arpit', 'Sharma', 'ACME-000005', 'ROLE_EMPLOYEE'),
        ('acme-000006', 'priya.nair@acme.com', 'Priya', 'Nair', 'ACME-000006', 'ROLE_ADMIN'),
        ('acme-000007', 'rahul.gupta@acme.com', 'Rahul', 'Gupta', 'ACME-000007', 'ROLE_ADMIN')
    ]
    
    bcrypt_hash = '$2b$10$SO7mGXLqrhDS/rEwAVMZZOFM1lbGKMD9omQGkF1kSRAU/mJpDyOei' # Admin@123
    
    for username, email, f_name, l_name, emp_code, role_code in other_users:
        user_uuid = uuid.uuid4().bytes
        emp_uuid = employee_ids[emp_code]
        
        # Create user
        cursor.execute("""
            INSERT INTO users (id, tenant_id, username, email, password_hash, first_name, last_name, employee_id, active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
        """, (user_uuid, tenant, username, email, bcrypt_hash, f_name, l_name, emp_uuid))
        
        # Find role ID
        cursor.execute("SELECT id FROM roles WHERE code = %s", (role_code,))
        role_id = cursor.fetchone()[0]
        
        # Assign role
        cursor.execute("""
            INSERT INTO user_roles (user_id, role_id)
            VALUES (%s, %s)
        """, (user_uuid, role_id))

    # Set sequence generator for org
    cursor.execute("""
        INSERT INTO employee_code_sequences (id, tenant_id, organization_id, prefix, current_sequence, sequence_length, pattern, deleted)
        VALUES (%s, %s, %s, 'ACME-', 8, 6, 'ACME-{SEQ:6}', 0)
    """, (uuid.uuid4().bytes, tenant, to_bin(org_id)))

    conn.commit()
    conn.close()
    print("\n[SUCCESS] Seeding completed successfully for Acme Corporation!")

if __name__ == '__main__':
    seed()
