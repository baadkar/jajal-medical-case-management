# Requirements Traceability Matrix (RTM)

In medical device and healthcare software development (IEC 62304 / ISO 13485 standards), requirements traceability ensures that every software requirement has a concrete implementation and an automated verification test.

---

## Traceability Matrix

| ID | Requirement (Input) | Implementation (Output) | Verification (Test) |
| :--- | :--- | :--- | :--- |
| **REQ-001** | Admin shall be able to create a case | `CaseController@store` + `CaseFormModal.tsx` | Feature test 4: `admin creates case` (assert 201 Created & DB persisted) |
| **REQ-002** | Case Number shall be unique | Unique DB index on `cases.case_number` + `StoreCaseRequest` unique rule | Feature test 5: `creating case with duplicate Case Number fails` (assert 422 Unprocessable Entity) |
| **REQ-003** | Only Admin shall delete cases | `CasePolicy@delete` / `CaseController@destroy` | Feature test 6: `viewer cannot delete a case` (assert 403 Forbidden) |
| **REQ-004** | All case pages and APIs must be hidden from unauthenticated guests | `auth:sanctum` middleware + Client Route Guard | Feature test 3: `guest cannot open case pages or APIs` (assert 401 Unauthorized / redirect) |
| **REQ-005** | Authorized user login with correct credentials must succeed | `AuthController@login` + Sanctum Token Generation | Feature test 1: `valid login succeeds` (assert 200 OK & Bearer token issued) |
| **REQ-006** | Invalid login attempts must be rejected with clear message | `AuthController@login` credential verification | Feature test 2: `invalid login is rejected` (assert 401 Unauthorized with error response) |
| **BONUS-01** | Engineer role can create/edit cases but cannot delete cases | `CasePolicy@create`, `CasePolicy@update`, `CasePolicy@delete` | Feature test 7: `engineer cannot delete a case` (assert 403 Forbidden) |
| **BONUS-02** | Form validation on required fields and allowed enumerations | `StoreCaseRequest` / `validateCaseInput` | Automated validation test checking empty fields and invalid enum status (assert 422 with field-level errors) |
| **BONUS-03** | Public holiday checks on surgery date with graceful error fallback | `NagerDateService` with timeout & fallback | Integration check on `/api/holidays` with abort controller |

---

## Verification Summary
All verification tests are implemented in:
1. `tests/Feature/CaseManagementTest.php` (PHPUnit / Pest suite)
2. `src/server/tests.ts` (Backend API test runner)
3. In-app interactive test execution UI at `/tests`
