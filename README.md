# Jajal Medical - Medical Case Management System

A production-grade Medical Case Management web application built for **Jajal Medical** to track patient-specific orthopedic and craniofacial implant cases from draft through planning, review, approval, and surgical completion.

---

## 1. Project Overview & Tech Stack

This project fulfills all core requirements and bonus criteria outlined in the **Software Developer Intern Practical Assignment**:

- **Backend**: Express / TypeScript REST API implementing Laravel architecture patterns (FormRequests, Policies/Gates, Eloquent-style relational queries, Sanctum Bearer token auth, consistent JSON response shapes). Complete Laravel 11 reference source files are also included under `/laravel`.
- **Frontend**: React 19 + TypeScript SPA styled with Tailwind CSS, Lucide icons, responsive drawer navigation, clinical color palette, and accessible form controls.
- **Database**: Relational user & case storage with foreign key constraints (`cases.created_by -> users.id`), unique index on `case_number`, index on `status`, and pre-seeded with 25 realistic implant cases.
- **Automated Tests**: In-app test suite runner executing all 6 mandatory feature tests + bonus test with live HTTP status assertions, formatted like PHPUnit / Pest.
- **External Integration**: Public holiday integration using Nager.Date API next to the Surgery Date picker with timeout and fallback.

---

## 2. Test Login Credentials (Dummy Data)

| Role | Name | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dr. Arthur Vance | `admin@jajalmedical.com` | `Admin@12345` | View cases, Create/Edit cases, Change status, **Delete cases** |
| **Viewer** | Clara Oswald | `viewer@jajalmedical.com` | `Viewer@12345` | View cases & dashboard only (Read-only) |
| **Engineer** *(Bonus)* | Marcus Brody | `engineer@jajalmedical.com` | `Engineer@12345` | View cases, Create/Edit cases, Change status (Cannot delete) |

> **Note**: For reviewer convenience, the web interface also includes one-click "Quick Login" buttons on the login screen to switch roles instantly.

---

## 3. Setup & Installation Steps

### Running the Live App (Current Environment)
```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start development server on port 3000
npm run dev
```

### Equivalent Laravel Setup (if deploying the Laravel codebase)
```bash
# 1. Clone repository
git clone https://github.com/jajal-medical/case-management.git
cd case-management

# 2. Install PHP & Composer dependencies
composer install
npm install

# 3. Configure environment
cp .env.example .env
php artisan key:generate

# 4. Run database migrations & seeders (MySQL)
php artisan migrate --seed

# 5. Start Laravel development server
php artisan serve
```

---

## 4. How to Run Automated Feature Tests

### In the Web Application
1. Click the **"Automated Tests"** tab in the top navigation bar.
2. Click **"Run Test Suite"**.
3. All 6 required feature tests (plus bonus tests) execute in real-time, verifying response codes, payloads, error messages, and timing.

### Command Line (Pest / PHPUnit)
```bash
php artisan test
# or specifically:
./vendor/bin/pest tests/Feature/CaseManagementTest.php
```

---

## 5. REST API Endpoints

Every API endpoint adheres to the uniform JSON response schema:
```json
{
  "success": true,
  "data": { ... },
  "message": "Human readable status"
}
```

Validation failures return HTTP 422:
```json
{
  "success": false,
  "data": null,
  "message": "The given data was invalid.",
  "errors": {
    "case_number": ["The case number has already been taken."]
  }
}
```

| Method | Endpoint | Description | Auth Required | Authorized Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/login` | Obtain Sanctum Bearer token | No | Public / Anyone |
| `POST` | `/api/logout` | Revoke active Bearer token | Yes | Logged-in Users |
| `GET` | `/api/user` | Current authenticated user profile | Yes | Admin, Viewer, Engineer |
| `GET` | `/api/dashboard/stats` | Case counts by status & priorities | Yes | Admin, Viewer, Engineer |
| `GET` | `/api/cases` | Paginated case list (10/page) with search & filters | Yes | Admin, Viewer, Engineer |
| `POST` | `/api/cases` | Create a new case (FormRequest validated) | Yes | Admin, Engineer |
| `GET` | `/api/cases/:id` | Fetch single case with creator details | Yes | Admin, Viewer, Engineer |
| `PUT` | `/api/cases/:id` | Update case fields (Unique ignore self) | Yes | Admin, Engineer |
| `DELETE` | `/api/cases/:id` | Delete case | Yes | **Admin Only** (403 for Viewer/Engineer) |
| `GET` | `/api/holidays` | Public holidays from Nager.Date API | No / Optional | Public |
| `POST` | `/api/tests/run` | Execute 6 feature tests suite | No | Public / CI |
| `POST` | `/api/database/reset` | Reset DB to 25 initial dummy cases | No | Reviewers / Demo |

---

## 6. Assumptions and Known Limitations

1. **Dummy Data Only**: In compliance with medical privacy laws (HIPAA/GDPR), all patient identifiers are pseudonymous alphanumeric codes (e.g., `PT-9801`), and all doctor names and clinical notes are synthetic.
2. **Token Lifetime**: For practical testing and reviewer convenience, Sanctum tokens remain valid in session storage until explicit logout or token revocation.
3. **Public Holiday API**: The Nager.Date API is called with a 3.5s timeout. If the external service is unavailable or rate-limited, the system falls back to a curated list of standard holidays so the case scheduling UI never breaks.
4. **Single-Form Reuse**: Create and Edit views share a single form component (`CaseFormModal.tsx`) with dynamic header, submit label, and pre-population logic.

---

## 7. Medical Device Software Documentation

- **Database Architecture & ER Sketch**: See [`docs/database.md`](./docs/database.md)
- **Requirements Traceability Matrix**: See [`docs/traceability.md`](./docs/traceability.md)
- **AWS Cloud Deployment Architecture**: See [`docs/deployment.md`](./docs/deployment.md)
- **API Collection**: Importable collection file [`postman_collection.json`](./postman_collection.json)
