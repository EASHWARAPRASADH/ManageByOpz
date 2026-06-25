import urllib.request
import urllib.error
import json
import sys
import mysql.connector
import random
import datetime

def run_test():
    print("=== STARTING FULL END-TO-END RECRUITMENT LIFE CYCLE INTEGRATION TEST ===")
    
    # 1. Authenticate as Admin to retrieve JWT Token
    print("\n[Step 1] Authenticating as Admin...")
    login_data = json.dumps({
        "email": "admin@managemyopz.com",
        "password": "Admin@123"
    }).encode('utf-8')
    
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/auth/login",
        data=login_data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    token = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode('utf-8'))
            token = resp_data.get("accessToken")
            print("Admin successfully authenticated.")
    except urllib.error.HTTPError as err:
        print(f"Auth failed with HTTP status: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)
    except Exception as ex:
        print(f"Auth request failed: {ex}")
        sys.exit(1)
        
    if not token:
        print("Failed to retrieve token from auth response.")
        sys.exit(1)

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    # 2. Get a valid position from the database
    print("\n[Step 2] Querying database for a valid Position...")
    try:
        import uuid
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Dhipak#2006#',
            database='managemyopz_hr'
        )
        cursor = conn.cursor()
        cursor.execute("SELECT bin_to_uuid(id), title FROM positions LIMIT 1")
        row = cursor.fetchone()
        if not row:
            print("No positions found in database! Creating a dummy position first...")
            position_uuid = str(uuid.uuid4())
            position_title = "Staff Software Engineer"
            cursor.execute("""
                INSERT INTO positions (id, tenant_id, title, status, budgeted, vacant, filled, deleted, version)
                VALUES (uuid_to_bin(%s), 'ACME', %s, 'ACTIVE', 1, 1, 0, 0, 0)
            """, (position_uuid, position_title))
            conn.commit()
            print(f"Created position: {position_title} (ID: {position_uuid})")
            position_id = position_uuid
        else:
            position_id = row[0]
            position_title = row[1]
            print(f"Using position: {position_title} (ID: {position_id})")
        
        # Also get a valid User ID to act as approver / interviewer
        cursor.execute("SELECT bin_to_uuid(id) FROM users WHERE username = 'admin@managemyopz.com' OR email = 'admin@managemyopz.com'")
        approver_row = cursor.fetchone()
        if not approver_row:
            print("Admin user not found in database! Using first user in users table...")
            cursor.execute("SELECT bin_to_uuid(id) FROM users LIMIT 1")
            approver_id = cursor.fetchone()[0]
        else:
            approver_id = approver_row[0]
        print(f"Using Admin User ID as approver/interviewer: {approver_id}")
        conn.close()
    except Exception as e:
        print(f"Database query failed: {e}")
        sys.exit(1)

    # 3. Create a Requisition
    print("\n[Step 3] Creating a new Manpower Requisition...")
    req_number = f"REQ-{random.randint(100000, 999999)}"
    requisition_payload = {
        "reqNumber": req_number,
        "title": f"Requisition for {position_title}",
        "department": "Engineering",
        "vacancies": 2,
        "priority": "HIGH",
        "status": "DRAFT",
        "hiringReason": "Expansion of the core team"
    }
    
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/recruitment/requisitions",
        data=json.dumps(requisition_payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    
    requisition_id = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            requisition = data.get("data")
            requisition_id = requisition.get("id")
            print(f"Requisition created. ID: {requisition_id}, Number: {req_number}, Status: {requisition.get('status')}")
    except urllib.error.HTTPError as err:
        print(f"Requisition creation failed: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)

    # 4. Submit Requisition
    print("\n[Step 4] Submitting Requisition...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/recruitment/requisitions/{requisition_id}/submit",
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            requisition = data.get("data")
            print(f"Requisition submitted. Status: {requisition.get('status')}")
    except urllib.error.HTTPError as err:
        print(f"Requisition submission failed: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)

    # 5. Approve Requisition
    print("\n[Step 5] Approving Requisition...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/recruitment/requisitions/{requisition_id}/approve?approverId={approver_id}&comments=Approved+for+hiring",
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            requisition = data.get("data")
            print(f"Requisition approved. Status: {requisition.get('status')}")
    except urllib.error.HTTPError as err:
        print(f"Requisition approval failed: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)

    # 6. Create Job Posting
    print("\n[Step 6] Creating Job Posting...")
    job_posting_payload = {
        "position": {"id": position_id},
        "jobTitle": f"Senior {position_title}",
        "jobDescription": "We are looking for a senior developer to join our team.",
        "skills": "React, Spring Boot, SQL",
        "location": "San Francisco, CA",
        "employmentType": "FULL_TIME",
        "status": "DRAFT"
    }
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/recruitment/jobs",
        data=json.dumps(job_posting_payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    job_posting_id = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            posting = data.get("data")
            job_posting_id = posting.get("id")
            print(f"Job posting created. ID: {job_posting_id}, Title: {posting.get('jobTitle')}")
    except urllib.error.HTTPError as err:
        print(f"Job posting creation failed: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)

    # 7. Create Candidate Application
    print("\n[Step 7] Registering Candidate Application...")
    cand_suffix = str(random.randint(1000, 9999))
    candidate_payload = {
        "fullName": f"John Doe {cand_suffix}",
        "email": f"john.doe.{cand_suffix}@gmail.com",
        "phone": f"555-019{random.randint(0,9)}",
        "location": "Seattle, WA",
        "skills": "React, Spring Boot, Docker",
        "experienceYears": 5.5,
        "noticePeriodDays": 30,
        "status": "APPLIED",
        "jobPosting": {"id": job_posting_id}
    }
    # Note: candidates endpoint has permitAll()
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/recruitment/candidates",
        data=json.dumps(candidate_payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    candidate_id = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            candidate = data.get("data")
            candidate_id = candidate.get("id")
            print(f"Candidate registered. ID: {candidate_id}, Full Name: {candidate.get('fullName')}, Stage: {candidate.get('status')}")
    except urllib.error.HTTPError as err:
        print(f"Candidate registration failed: {err.code}")
        sys.exit(1)

    # 8. Move Candidate to Screening Stage
    print("\n[Step 8] Screening Candidate...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/recruitment/candidates/{candidate_id}/stage?status=SCREENING",
        headers=headers,
        method='PUT'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            candidate = data.get("data")
            print(f"Candidate stage updated. New Stage: {candidate.get('status')}")
    except urllib.error.HTTPError as err:
        print(f"Candidate screening update failed: {err.code}")
        sys.exit(1)

    # 9. Add Notes to Candidate Profile
    print("\n[Step 9] Adding interview notes to Candidate profile...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/recruitment/candidates/{candidate_id}/notes?noteText=Candidate+has+strong+React+experience&authorId={approver_id}",
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            note = data.get("data")
            print(f"Note added: '{note.get('noteText')}'")
    except urllib.error.HTTPError as err:
        print(f"Adding notes failed: {err.code}")
        sys.exit(1)

    # 10. Schedule an Interview
    print("\n[Step 10] Scheduling Technical Interview...")
    interview_time = (datetime.datetime.now() + datetime.timedelta(days=2)).strftime("%Y-%m-%dT%H:%M:%S")
    interview_payload = {
        "candidate": {"id": candidate_id},
        "interviewType": "TECHNICAL_ROUND",
        "scheduledTime": interview_time,
        "interviewerIds": approver_id,
        "status": "SCHEDULED"
    }
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/recruitment/interviews",
        data=json.dumps(interview_payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    interview_id = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            interview = data.get("data")
            interview_id = interview.get("id")
            print(f"Interview scheduled. ID: {interview_id}, Type: {interview.get('interviewType')}, Scheduled Time: {interview.get('scheduledTime')}")
    except urllib.error.HTTPError as err:
        print(f"Interview scheduling failed: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)

    # 11. Submit Interview Feedback Scorecard
    print("\n[Step 11] Submitting Interview Feedback...")
    feedback_payload = {
        "interviewerId": approver_id,
        "technicalRating": 5,
        "communicationRating": 4,
        "problemSolvingRating": 5,
        "cultureFitRating": 4,
        "overallRecommendation": "STRONG_HIRE",
        "feedbackNotes": "Excellent problem solver, fits the team perfectly."
    }
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/recruitment/interviews/{interview_id}/feedback",
        data=json.dumps(feedback_payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            feedback = data.get("data")
            print(f"Feedback submitted. Recommendation: {feedback.get('overallRecommendation')}")
    except urllib.error.HTTPError as err:
        print(f"Feedback submission failed: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)

    # 12. Create Job Offer package
    print("\n[Step 12] Generating Job Offer package...")
    offer_payload = {
        "candidate": {"id": candidate_id},
        "position": {"id": position_id},
        "ctc": 120000.00,
        "bonus": 10000.00,
        "joiningBonus": 5000.00,
        "joiningDate": (datetime.date.today() + datetime.timedelta(days=30)).strftime("%Y-%m-%d"),
        "location": "San Francisco, CA",
        "status": "DRAFT"
    }
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/recruitment/offers",
        data=json.dumps(offer_payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    offer_id = None
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            offer = data.get("data")
            offer_id = offer.get("id")
            print(f"Offer generated. ID: {offer_id}, CTC: {offer.get('ctc')}, Status: {offer.get('status')}")
    except urllib.error.HTTPError as err:
        print(f"Offer generation failed: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)

    # 13. Approve Job Offer
    print("\n[Step 13] Approving Offer...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/recruitment/offers/{offer_id}/approve?approverId={approver_id}&comments=Compensation+is+approved",
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            offer = data.get("data")
            print(f"Offer approved. Status: {offer.get('status')}")
    except urllib.error.HTTPError as err:
        print(f"Offer approval failed: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)

    # 14. Accept Offer & Convert Candidate to Employee Digital Twin
    print("\n[Step 14] Accepting Offer (Triggers Digital Twin Conversion)...")
    req = urllib.request.Request(
        f"http://localhost:8080/api/v1/recruitment/offers/{offer_id}/accept",
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            offer = data.get("data")
            print(f"Offer accepted. Final Offer Status: {offer.get('status')}")
    except urllib.error.HTTPError as err:
        print(f"Offer acceptance failed: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)

    # 14b. Accept Offer Again to verify Idempotency
    print("\n[Step 14b] Accepting Offer Again (Verifying Idempotency)...")
    req_dup = urllib.request.Request(
        f"http://localhost:8080/api/v1/recruitment/offers/{offer_id}/accept",
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req_dup, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            offer_dup = data.get("data")
            print(f"Duplicate offer acceptance succeeded. Status: {offer_dup.get('status')}")
    except urllib.error.HTTPError as err:
        print(f"ERROR: Duplicate offer acceptance failed! Status code: {err.code}")
        print(err.read().decode('utf-8'))
        sys.exit(1)

    # 15. Verify creation of Employee Twin in database
    print("\n[Step 15] Verifying Employee Twin creation in database...")
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Dhipak#2006#',
            database='managemyopz_hr'
        )
        cursor = conn.cursor()
        
        # Verify exactly 1 twin exists
        cursor.execute(
            "SELECT COUNT(*) FROM employee_twins WHERE work_email = %s",
            (f"john.doe.{cand_suffix}@gmail.com",)
        )
        count = cursor.fetchone()[0]
        
        cursor.execute(
            "SELECT employee_code, first_name, last_name, work_email, employment_status FROM employee_twins WHERE work_email = %s",
            (f"john.doe.{cand_suffix}@gmail.com",)
        )
        employee = cursor.fetchone()
        conn.close()
        
        if employee:
            print("SUCCESS: Employee Twin successfully created!")
            print(f"Employee Code: {employee[0]}")
            print(f"Name: {employee[1]} {employee[2]}")
            print(f"Email: {employee[3]}")
            print(f"Employment Status: {employee[4]}")
            
            if count == 1:
                print("SUCCESS: Exactly 1 Employee Twin exists in database (idempotency verified).")
                print("\n=== RECRUITMENT LIFE CYCLE TEST PASSED SUCCESSFULLY! ===")
            else:
                print(f"FAILED: Found {count} Employee Twins (idempotency violated).")
                sys.exit(1)
        else:
            print("FAILED: Employee Twin not found in database.")
            sys.exit(1)
    except Exception as e:
        print(f"Database verification failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_test()
