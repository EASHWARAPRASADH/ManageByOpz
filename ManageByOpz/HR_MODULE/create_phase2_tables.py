import mysql.connector

def main():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Dhipak#2006#",
        database="managemyopz_hr"
    )
    cursor = conn.cursor()

    tables = {
        "holiday_calendars": """
            CREATE TABLE IF NOT EXISTS holiday_calendars (
                id BINARY(16) NOT NULL PRIMARY KEY,
                tenant_id VARCHAR(255) NOT NULL,
                organization_id BINARY(16) NULL,
                calendar_name VARCHAR(255) NOT NULL,
                country VARCHAR(255) NULL,
                state VARCHAR(255) NULL,
                year INT NOT NULL,
                active TINYINT(1) NOT NULL DEFAULT 1,
                created_by VARCHAR(255) NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(255) NULL,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                version BIGINT DEFAULT 0,
                deleted TINYINT(1) NOT NULL DEFAULT 0,
                deleted_at TIMESTAMP NULL,
                deleted_by VARCHAR(255) NULL,
                effective_date DATETIME(6) NULL
            ) ENGINE=InnoDB;
        """,
        "holiday_calendar_days": """
            CREATE TABLE IF NOT EXISTS holiday_calendar_days (
                id BINARY(16) NOT NULL PRIMARY KEY,
                tenant_id VARCHAR(255) NOT NULL,
                holiday_calendar_id BINARY(16) NOT NULL,
                holiday_date DATE NOT NULL,
                holiday_name VARCHAR(255) NOT NULL,
                holiday_type VARCHAR(50) NOT NULL,
                optional_holiday TINYINT(1) NOT NULL DEFAULT 0,
                active TINYINT(1) NOT NULL DEFAULT 1,
                created_by VARCHAR(255) NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(255) NULL,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                version BIGINT DEFAULT 0,
                deleted TINYINT(1) NOT NULL DEFAULT 0,
                deleted_at TIMESTAMP NULL,
                deleted_by VARCHAR(255) NULL,
                effective_date DATETIME(6) NULL
            ) ENGINE=InnoDB;
        """,
        "leave_policies": """
            CREATE TABLE IF NOT EXISTS leave_policies (
                id BINARY(16) NOT NULL PRIMARY KEY,
                tenant_id VARCHAR(255) NOT NULL,
                policy_name VARCHAR(255) NOT NULL,
                policy_code VARCHAR(255) NOT NULL,
                description VARCHAR(255) NULL,
                effective_from DATE NULL,
                effective_to DATE NULL,
                active TINYINT(1) NOT NULL DEFAULT 1,
                created_by VARCHAR(255) NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(255) NULL,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                version BIGINT DEFAULT 0,
                deleted TINYINT(1) NOT NULL DEFAULT 0,
                deleted_at TIMESTAMP NULL,
                deleted_by VARCHAR(255) NULL,
                effective_date DATETIME(6) NULL
            ) ENGINE=InnoDB;
        """,
        "leave_policy_rules": """
            CREATE TABLE IF NOT EXISTS leave_policy_rules (
                id BINARY(16) NOT NULL PRIMARY KEY,
                tenant_id VARCHAR(255) NOT NULL,
                policy_id BINARY(16) NOT NULL,
                leave_type_id BINARY(16) NOT NULL,
                allocated_days DOUBLE NOT NULL,
                accrual_method VARCHAR(50) NOT NULL,
                carry_forward_limit DOUBLE NOT NULL,
                encashment_allowed TINYINT(1) NOT NULL DEFAULT 0,
                negative_balance_allowed TINYINT(1) NOT NULL DEFAULT 0,
                created_by VARCHAR(255) NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(255) NULL,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                version BIGINT DEFAULT 0,
                deleted TINYINT(1) NOT NULL DEFAULT 0,
                deleted_at TIMESTAMP NULL,
                deleted_by VARCHAR(255) NULL,
                effective_date DATETIME(6) NULL
            ) ENGINE=InnoDB;
        """,
        "leave_policy_assignments": """
            CREATE TABLE IF NOT EXISTS leave_policy_assignments (
                id BINARY(16) NOT NULL PRIMARY KEY,
                tenant_id VARCHAR(255) NOT NULL,
                policy_id BINARY(16) NOT NULL,
                organization_id BINARY(16) NULL,
                business_unit_id BINARY(16) NULL,
                department_id BINARY(16) NULL,
                grade_id BINARY(16) NULL,
                band_id BINARY(16) NULL,
                employment_type_id BINARY(16) NULL,
                created_by VARCHAR(255) NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR(255) NULL,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                version BIGINT DEFAULT 0,
                deleted TINYINT(1) NOT NULL DEFAULT 0,
                deleted_at TIMESTAMP NULL,
                deleted_by VARCHAR(255) NULL,
                effective_date DATETIME(6) NULL
            ) ENGINE=InnoDB;
        """
    }

    for name, sql in tables.items():
        print(f"Creating table {name}...")
        cursor.execute(sql)
    
    conn.commit()
    cursor.close()
    conn.close()
    print("All Phase 2 tables created successfully!")

if __name__ == "__main__":
    main()
