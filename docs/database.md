# Database Architecture & Entity Relationships

This document outlines the database schema for the Jajal Medical Case Management system, including table structures, data types, indexes, and relational integrity.

---

## 1. Entity-Relationship Diagram (ERD)

```text
+------------------------------------+
|               USERS                |
+------------------------------------+
| PK  id             BIGINT UNSIGNED |
|     name           VARCHAR(255)    |
| U   email          VARCHAR(255)    |
|     password       VARCHAR(255)    |
|     role           ENUM(...)       |  <-- ('admin', 'viewer', 'engineer')
|     remember_token VARCHAR(100)    |
|     created_at     TIMESTAMP       |
|     updated_at     TIMESTAMP       |
+------------------------------------+
                  | 1
                  |
                  | hasMany
                  | (creates)
                  |
                  v N
+------------------------------------+
|               CASES                |
+------------------------------------+
| PK  id                BIGINT UN    |
| U   case_number       VARCHAR(50)  |  <-- UNIQUE INDEX (e.g. 'CASE-0001')
|     patient_reference VARCHAR(50)  |  <-- (e.g. 'PT-9801')
|     surgeon_name      VARCHAR(255) |
|     implant_type      VARCHAR(255) |
| IDX status            ENUM(...)    |  <-- INDEXED ('Draft', 'Planning', 'In Review', 'Approved', 'Completed', 'Cancelled')
|     priority          ENUM(...)    |  <-- ('Low', 'Medium', 'High')
|     surgery_date      DATE NULL    |  <-- YYYY-MM-DD
| FK  created_by        BIGINT UN    |  <-- REFERENCES users(id) ON DELETE RESTRICT
|     created_at        TIMESTAMP    |
|     updated_at        TIMESTAMP    |
+------------------------------------+

                  | 1
                  |
                  | hasMany
                  v N
+------------------------------------+
|      PERSONAL_ACCESS_TOKENS        |  <-- Laravel Sanctum Token Store
+------------------------------------+
| PK  id             BIGINT UNSIGNED |
|     tokenable_type VARCHAR(255)    |
|     tokenable_id   BIGINT UNSIGNED |
|     name           VARCHAR(255)    |
| U   token          VARCHAR(64)     |
|     abilities      TEXT            |
|     last_used_at   TIMESTAMP       |
|     expires_at     TIMESTAMP       |
|     created_at     TIMESTAMP       |
|     updated_at     TIMESTAMP       |
+------------------------------------+
```

---

## 2. Table Definitions

### Table: `users`
Stores system accounts with assigned roles for Role-Based Access Control (RBAC).

| Column | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | Primary Key, Auto-increment | Unique user identity |
| `name` | `VARCHAR(255)` | NOT NULL | User full name |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | User login email address |
| `password` | `VARCHAR(255)` | NOT NULL | Bcrypt hashed password |
| `role` | `ENUM('admin', 'viewer', 'engineer')` | NOT NULL, DEFAULT 'viewer' | RBAC access level |
| `created_at` | `TIMESTAMP` | NULLABLE | Creation timestamp |
| `updated_at` | `TIMESTAMP` | NULLABLE | Last update timestamp |

### Table: `cases`
Stores patient-specific surgical implant cases from inception to completion.

| Column | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | Primary Key, Auto-increment | Internal case identifier |
| `case_number` | `VARCHAR(50)` | NOT NULL, UNIQUE INDEX | Case reference code (e.g. `CASE-0001`) |
| `patient_reference` | `VARCHAR(50)` | NOT NULL | Pseudonymous patient ID (e.g. `PT-9801`) |
| `surgeon_name` | `VARCHAR(255)` | NOT NULL | Lead operating surgeon name |
| `implant_type` | `VARCHAR(255)` | NOT NULL | Medical implant device type |
| `status` | `ENUM(...)` | NOT NULL, INDEX | `Draft`, `Planning`, `In Review`, `Approved`, `Completed`, `Cancelled` |
| `priority` | `ENUM(...)` | NOT NULL | `Low`, `Medium`, `High` |
| `surgery_date` | `DATE` | NULLABLE | Planned operation date (`YYYY-MM-DD`) |
| `created_by` | `BIGINT UNSIGNED` | NOT NULL, FOREIGN KEY | References `users.id` |
| `created_at` | `TIMESTAMP` | NOT NULL | Automated creation timestamp |
| `updated_at` | `TIMESTAMP` | NOT NULL | Automated update timestamp |

---

## 3. Database Indexes & Constraints

1. **`cases_case_number_unique`**:
   - Unique index on `cases.case_number`. Prevents duplicate tracking numbers across the hospital enterprise.
2. **`cases_status_index`**:
   - B-tree index on `cases.status`. Accelerates status-based dashboard filtering and metrics aggregation.
3. **`cases_created_by_foreign`**:
   - Foreign key constraint: `FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT`. Ensures every case is tied to a verified system user and prevents orphan case records.

---

## 4. Seed Data Summary
The database seeder pre-populates:
- **3 User Accounts**: 1 Admin (`Dr. Arthur Vance`), 1 Viewer (`Clara Oswald`), 1 Engineer (`Marcus Brody`).
- **25 Implant Cases**: Spanning Cranial, Spinal, Orthopedic, TMJ, Maxillofacial, and Knee devices across all six lifecycle states.
