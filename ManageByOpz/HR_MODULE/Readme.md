

## SYSTEM ROLE

You are a:

* Principal Enterprise Architect
* SaaS Platform Architect
* HR Domain Architect
* Solution Architect
* Staff Software Engineer
* Database Architect
* Product Architect
* DDD Specialist
* Event Driven Architecture Specialist

Design a next-generation Enterprise HR Operating System.

This is NOT an HRMS.

This is an Enterprise HR Platform that will eventually support:

* 100,000+ Employees
* 1,000+ Organizations
* Unlimited Modules
* AI Agents
* Workforce Intelligence
* Enterprise Integrations

without redesigning the architecture.

---

# OBJECTIVE

Design the complete base architecture from scratch.

The goal is NOT to build modules first.

The goal is to build a platform foundation that future modules can plug into.

The platform must be capable of supporting:

Phase 1

* Employee Master
* Employee Digital Twin
* Self Service Portal
* Leave Management
* Recognition Platform

Phase 2

* Attendance
* Payroll
* Recruitment
* Onboarding
* Offboarding
* Document Management

Phase 3

* Performance
* Learning
* Goals
* Competencies
* Succession

Phase 4

* Projects
* Timesheets
* Assets
* Expenses
* Travel

Phase 5

* Workforce Intelligence
* AI Copilot
* Predictive Analytics
* Agentic HR
* Voice Assistant

Phase 6

* Marketplace
* External Integrations
* Third Party Extensions

No database redesign should be required.

---

# TECHNOLOGY STACK

Frontend

* React 18
* TypeScript
* Redux Toolkit
* RTK Query
* Tailwind CSS
* ShadCN

Backend

* Spring Boot 3
* Java 21
* Spring Security
* Spring Events
* JPA
* Hibernate
* Flyway

Database

* MySQL 8

Caching

* Redis

Storage

* MinIO

Search

* OpenSearch

Monitoring

* Prometheus
* Grafana

Messaging

* Spring Events initially
* Kafka Ready later

---

# CORE ARCHITECTURE PRINCIPLES

Design using:

1. Domain Driven Design

2. Modular Monolith

3. Event Driven Architecture

4. API First

5. Workflow First

6. Audit First

7. Security First

8. AI Ready

9. SaaS Multi Tenant

10. CQRS Ready

11. Microservice Ready

12. Extension Ready

13. Enterprise Scale

---

# PHASE 0 – PLATFORM FOUNDATION

Design these modules before any HR module.

---

## ORGANIZATION DNA PLATFORM

Build the organizational structure engine.

Tables:

* organizations
* business_units
* divisions
* departments
* sub_departments
* locations
* grades
* bands
* designations
* cost_centers
* employment_types

Every future module must consume this DNA.

No module may create its own organization structure.

---

## RBAC PLATFORM

Implement:

ROLE_ULTRA_SUPER_ADMIN

ROLE_SUPER_ADMIN

ROLE_ADMIN

ROLE_EMPLOYEE

Support:

* Role Hierarchy
* Module Permissions
* Feature Permissions
* Field Permissions
* Record Permissions
* Future Custom Roles

Design for future ABAC.

---

## AUDIT PLATFORM

Track:

* Create
* Update
* Delete
* Approve
* Reject
* Login
* Logout
* Export

Store:

* Before JSON
* After JSON
* User
* Role
* Tenant
* IP
* Timestamp

Every module must automatically audit actions.

---

## WORKFLOW PLATFORM

Reusable workflow engine.

Support:

* Leave
* Recognition
* Attendance
* Payroll
* Recruitment
* Assets
* Future Modules

Capabilities:

* Approval Chains
* Parallel Approvals
* Delegation
* Escalation
* SLA
* Versioning

Workflow must be generic.

---

## NOTIFICATION PLATFORM

Channels:

* Email
* SMS
* WhatsApp
* In App

Template Based.

Event Driven.

Reusable across all modules.

---

## MODULE REGISTRY PLATFORM

Design a true plug-in architecture.

Each module must register itself.

Examples:

```text
core-hr
leave
recognition
attendance
payroll
recruitment
performance
learning
assets
ai
```

Adding a module must require:

* Migration
* Module Registration

Nothing else.

---

# PHASE 1 – EMPLOYEE DIGITAL TWIN

This is the platform core.

Employee Master must NOT be a normal employee table.

The Employee Digital Twin becomes the master record.

---

## EMPLOYEE TWIN CORE

Design aggregate:

EmployeeTwin

Containing:

### Identity

* Employee Code
* Name
* DOB
* Gender
* Nationality
* Language

### Contact

* Email
* Phone
* Address
* Emergency Contacts

### Employment DNA

* Organization
* Department
* Designation
* Location
* Grade
* Band
* Cost Center
* Manager

### Compliance

* PAN
* Aadhaar
* UAN
* ESIC

### Banking

* Bank
* Account
* IFSC

---

## EMPLOYEE TWIN EXTENSIONS

Separate modules:

employee_skills

employee_certifications

employee_documents

employee_relationships

employee_timeline

custom_fields

---

## EMPLOYEE RELATIONSHIP GRAPH

Support:

* Manager
* Buddy
* Mentor
* Reviewer
* HRBP
* Project Manager

Graph Ready.

---

## EMPLOYEE TIMELINE

Track:

* Joining
* Promotion
* Transfer
* Recognition
* Training
* Salary Revision
* Certification
* Exit

---

## EMPLOYEE DOCUMENT VAULT

Support:

* Versioning
* Expiry
* Verification
* OCR Ready
* Digital Signature Ready

---

## SKILLS CLOUD

Support:

* Technical Skills
* Functional Skills
* Soft Skills
* Languages
* Certifications

---

# PHASE 1A – SELF SERVICE PORTAL

Build SSP on top of Twin.

Features:

* My Profile
* My Documents
* My Requests
* My Recognition
* My Notifications
* My Timeline

Manager Portal:

* Team Overview
* Team Requests
* Team Recognition

---

# PHASE 1B – LEAVE MANAGEMENT

Design:

* Leave Policies
* Leave Types
* Leave Balances
* Holiday Calendars
* Approval Workflow
* Carry Forward
* Encashment

Integrate with Workflow Engine.

---

# PHASE 1C – RECOGNITION PLATFORM

Design:

* Peer Recognition
* Manager Recognition
* Organizational Recognition
* Awards
* Badges
* Milestones
* Points

Integrate with Timeline.

---

# UI ARCHITECTURE

Inspiration:

* Workday
* Darwinbox
* SAP SuccessFactors
* ServiceNow
* Linear
* Notion

Layout:

```text
Dark Sidebar
Light Workspace
Global Search
Command Palette
Quick Actions
Notification Center
```

Employee Twin UI:

```text
Employee Directory
      ↓
Employee 360 Workspace
      ↓
Identity
Employment DNA
Skills
Documents
Relationships
Timeline
```

---

# OUTPUT REQUIRED

Generate:

1. Enterprise Architecture Diagram

2. Domain Architecture

3. Database Architecture

4. ER Diagram

5. Platform Foundation Architecture

6. Organization DNA Design

7. RBAC Design

8. Audit Platform Design

9. Workflow Engine Design

10. Notification Platform Design

11. Module Registry Design

12. Employee Digital Twin Architecture

13. Employee Master Design

14. Self Service Portal Design

15. Leave Management Design

16. Recognition Platform Design

17. Database Schema

18. Folder Structure

19. Event Driven Architecture

20. API Architecture

21. Security Architecture

22. Frontend Architecture

23. Backend Architecture

24. Scalability Strategy

25. Future Module Strategy

26. AI Readiness Strategy

27. 12 Sprint Implementation Roadmap

28. Priority Order of Development

29. Risks & Mitigations

30. Production Deployment Strategy

Design this as an enterprise platform that can compete with Darwinbox, Keka, Zoho People, greytHR, SAP SuccessFactors, and Workday while remaining modular, maintainable, extensible, and future-proof.


