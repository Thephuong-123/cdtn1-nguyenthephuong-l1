# Deployment Guide – Customer Profile Management and Merge System

**Project:** Mekong Mobile CRM
**Track:** Software Engineering (SE)
**Purpose:** BT3 – local deployment, verification, and security checks

## 1. Requirements

The application manages customer profiles, detects potential duplicates, and supports customer profile merging. It uses React, Node.js/Express, PostgreSQL, Docker Compose, and Nginx.

**Required host software:**

- Docker Desktop with Docker Compose
- Git
- Internet access to obtain Docker images and dependencies
- Available host ports `3001` (backend) and `8080` (frontend) under the default demonstration configuration

Node.js and PostgreSQL do not need to be installed separately on the host because the application runs them inside containers.

This guide describes a **local demonstration deployment**, not a production-ready configuration.

## 2. Configuration

Clone the repository:

```powershell
git clone https://github.com/Thephuong-123/cdtn1-nguyenthephuong-l1.git
cd cdtn1-nguyenthephuong-l1
```

The repository includes `.env.example`, which supplies demonstration configuration values. The main configuration variables are:

| Variable | Description |
|---|---|
| `DB_HOST` | Database hostname within the Docker network |
| `DB_PORT` | PostgreSQL internal port |
| `DB_NAME` | PostgreSQL database name |
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | Secret used to sign and validate JWTs |
| `PORT` | Express service port inside its container |
| `APP_PORT` | Backend port exposed on the host |
| `FRONTEND_PORT` | Frontend port exposed on the host |

**Security:** Do not commit real credentials, local `.env` files, or production JWT secrets. Replace demonstration secrets before any deployment beyond the local test environment.

## 3. Deployment

After cloning the project and changing to its directory, use the following **two deployment commands** in PowerShell.

**Command 1 – Create the local environment file:**

```powershell
Copy-Item .env.example .env
```

**Command 2 – Build and start all services:**

```powershell
docker compose up -d --build
```

Docker Compose runs three services:

- **`db`** – PostgreSQL 16, including database initialization and demonstration data for a new volume.
- **`app`** – Node.js/Express REST API.
- **`frontend`** – React production build served through Nginx.

The database uses a persistent Docker volume. The backend starts after the database healthcheck succeeds; the frontend starts after the backend satisfies its configured health requirement.

**Database initialization:** SQL initialization scripts run when PostgreSQL initializes an **empty** data volume. They are not automatically rerun when an existing initialized volume is reused.

## 4. Verification

### 4.1 Check container health

```powershell
docker compose ps
```

**Expected result:** `db`, `app`, and `frontend` are running and show a healthy state after startup completes.

### 4.2 Open the frontend

Visit `http://localhost:8080` in a browser.

**Expected result:** The application login page loads. Sign in with a configured demonstration account to access customer management.

### 4.3 Check the backend health endpoint

```powershell
Invoke-RestMethod http://localhost:8080/health
```

**Expected response:**

```json
{
  "status": "ok"
}
```

This response indicates that the HTTP health endpoint responds; it does **not** independently validate every database operation.

### 4.4 Verify JWT authentication

The customer and duplicate routes require a valid Bearer JWT. A request without a token must not reveal customer data.

```powershell
try {
    Invoke-RestMethod http://localhost:8080/api/customers
}
catch {
    if ($null -ne $_.Exception.Response) {
        Write-Host "HTTP Status:" ([int]$_.Exception.Response.StatusCode)
    }
    else {
        Write-Host "Request error:" $_.Exception.Message
    }
}
```

**Expected result:**

```text
HTTP Status: 401
```

The earlier unauthenticated command `(Invoke-RestMethod http://localhost:8080/api/customers).Count` is **not** a valid data check after JWT protection was introduced.

To view customer records, sign in using the frontend. A freshly initialized demonstration database was previously verified to contain five sample customer profiles; actual counts may differ after new profiles are created or profiles are deactivated.

### 4.5 Verify object-level authorization

For customer `PATCH` and `DELETE` operations, the backend applies these rules:

- **SALES:** may modify a customer only when the record's `created_by` matches the authenticated user's `user_id`.
- **MANAGER:** may modify customer records regardless of creator, subject to normal business validation.

The customer creator is assigned by the backend from the authenticated user, not trusted from the client's request body.

**Observed integration results on 14 November 2026:**

| Scenario | Actual result | Status |
|---|---|---|
| Request customer list without JWT | HTTP 401 | PASS |
| SALES user `1` attempts to PATCH customer `6`, created by user `2` | HTTP 403 | PASS |
| Compare customer `6` before and after the denied update | Data unchanged | PASS |
| Authenticated MANAGER PATCHes customer `6` using its existing values | HTTP 200 | PASS |

The last request was an actual write operation and may update the record's `updated_at` timestamp. The real-database integration checks above **do not** establish that every authorization scenario, especially DELETE, has been independently tested.

Evidence:

- `docs/screenshots/bt3-security/sales-forbidden-403.png`
- `docs/screenshots/bt3-security/manager-update-200.png`

### 4.6 Run backend automated tests

```powershell
docker compose exec app npm test
```

**Latest observed development run:** 17 tests passed, 0 failed. These include customer validation, duplicate detection, merge-related behavior, error handling, and authorization tests. Some tests use mocked dependencies rather than a live database.

### 4.7 Clean-clone verification

A separate clean-clone deployment was previously checked under the Compose project `bt3-clean-test`, using an independent PostgreSQL volume and alternate host ports `3101` (backend) and `8181` (frontend).

The **earlier** clean-clone evidence showed 16 passing tests because it predates the new customer-authorization test. The final Git revision must be checked again from a clean clone before creating release `v1.0`.

Earlier evidence is stored in `docs/screenshots/bt3-docker/`. In particular, `docker-test-16-pass.png` documents the historical 16-test run and should not be relabeled as 17 tests.

## 5. Troubleshooting and Maintenance

### Port conflict

If `3001` or `8080` is already occupied, change `APP_PORT` or `FRONTEND_PORT` in `.env`, then run:

```powershell
docker compose up -d --build
```

### Database connection failure

```powershell
docker compose logs db
```

Check the database health status and connection variables.

### Backend or frontend failure

```powershell
docker compose logs app frontend
```

Inspect errors and verify that dependencies become healthy.

### HTTP 401 Unauthorized

A request lacks valid authentication. Sign in and send the JWT as `Authorization: Bearer <TOKEN>` for protected endpoints.

### HTTP 403 Forbidden

The authenticated user lacks permission for the operation. For example, a SALES user may not modify someone else's customer record. Do not treat a deliberate authorization denial as an application crash.

### Stop the application

```powershell
docker compose down
```

This removes the containers and Compose network but retains the named PostgreSQL volume.

### Data loss warning

Do **not** run `docker compose down -v` unless deleting the database volume and stored data is intentional.

## Security Checklist

The following items must be reviewed before a non-demo deployment. They remain unchecked unless independently verified for the target environment.

- [ ] Ensure production secrets, credentials, and `.env` files are excluded from Git.
- [ ] Replace demonstration database passwords and JWT secrets with strong, unique values.
- [ ] Confirm secure password hashing and safe credential handling.
- [ ] Verify JWT authentication for all routes requiring protection.
- [ ] Verify role checks and object-level authorization, including real-database tests for sensitive write and delete operations.
- [ ] Ensure error responses and logs do not expose secrets, stack traces, or sensitive customer information.
- [ ] Enable HTTPS and appropriate production network restrictions.

**Note:** Passing local tests is evidence for the tested scenarios only. It is not a comprehensive security audit.

---

**Current status:** Local Docker deployment succeeded; the latest development test run passed 17/17 tests; selected real-database authorization scenarios passed. Final clean-clone verification and Git release `v1.0` remain pending.
