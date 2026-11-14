# API Documentation – BT3

**Project:** Mekong Mobile CRM – Customer Profile Management and Merge System
**Track:** Software Engineering (SE)
**Version:** BT3 working revision, 14 November 2026
**Base URL (Docker frontend / Nginx):** `http://localhost:8080/api`
**Direct backend URL:** `http://localhost:3001/api`
**Content type:** `application/json`
**Health endpoint:** `GET http://localhost:8080/health` (outside `/api`)

## 1. Overview and Conventions

This Express/PostgreSQL REST API provides user login, customer profile management, duplicate detection and customer merging. Successful responses use JSON. Unless explicitly indicated otherwise, examples below are **illustrative schemas based on the inspected routes, services and SQL repositories**, not transcripts of every endpoint executed against the database.

- **Authentication:** `Authorization: Bearer <JWT_TOKEN>` on every customer, duplicate and merge endpoint. Login and health check do not require a token.
- **Roles:** `SALES` and `MANAGER`. Customer `PATCH` and `DELETE` require the SALES user to own the record (`customer.created_by = req.user.user_id`), or the user to be a MANAGER. Customer creation assigns `created_by` on the server; the client must not supply it as authority.
- **Merge:** only MANAGER may call `POST /api/merges`.
- **Identifiers:** positive numeric database IDs; PostgreSQL `BIGSERIAL` values may appear as JSON strings (e.g. `"6"`) through the Node PostgreSQL driver. Do not assume UUIDs.
- **Telephone validation:** `0` followed by nine digits (`^0\d{9}$`) for creating and searching customer profiles.
- **General errors:** HTTP `401` for missing/invalid JWT, HTTP `403` for forbidden operations, and HTTP `500` for unexpected errors. The centralized error handler returns a public error code, sometimes a public message, but not an exception stack trace. Individual routes may return different combinations of `error` and `message`.
- **Example data:** names, numbers, record IDs and tokens in the following requests/responses are samples. A record or candidate may not exist, and modifying methods will change data if executed on the real system.

## 2. Authentication

### 2.1 POST `/api/auth/login`

| Field | Value |
|---|---|
| Purpose | Authenticate a user and obtain a JWT |
| Access | Public |
| Parameters | None |
| Request body | `username` (required string), `password` (required string) |
| Success | `200 OK` |
| Errors | `400 INVALID_LOGIN_DATA`, `401 INVALID_CREDENTIALS`, `500 INTERNAL_SERVER_ERROR` |

**Request example**

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "username": "manager",
  "password": "<DEMO_PASSWORD>"
}
```

**Example successful response** (fields follow `auth.service.js`; token redacted)

```json
{
  "token": "<JWT_TOKEN>",
  "token_type": "Bearer",
  "expires_in": 7200,
  "user": {
    "user_id": 2,
    "full_name": "Tran Thi Binh",
    "username": "manager",
    "role": "MANAGER"
  }
}
```

**Example error (`401`)**

```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Tên đăng nhập hoặc mật khẩu không chính xác."
}
```

Passwords are verified using `bcrypt.compare` against the stored `password_hash`. JWTs use HS256 and expire after two hours.

## 3. Customer Management

Customer operations require a valid JWT. The example customer object below illustrates the fields returned by `SELECT * FROM customer` and `RETURNING *`:

```json
{
  "customer_id": "6",
  "full_name": "Nguyen Van Example",
  "phone": "0985624856",
  "email": "example@example.com",
  "address": "Ho Chi Minh City",
  "created_by": "2",
  "is_active": true,
  "created_at": "2026-11-14T10:42:29.907Z",
  "updated_at": "2026-11-14T11:29:46.422Z"
}
```

### 3.1 GET `/api/customers`

| Field | Value |
|---|---|
| Purpose | List active customers in ascending customer ID order |
| Access | Authenticated SALES or MANAGER |
| Parameters | Optional query parameter `phone` (see §3.2) |
| Request body | None |
| Success | `200 OK` – JSON array |
| Errors | `401 UNAUTHORIZED`, `500 INTERNAL_SERVER_ERROR` |

**Request example:** `GET /api/customers` with a Bearer JWT.

**Example response (`200`)**

```json
[
  {
    "customer_id": "6",
    "full_name": "Nguyen Van Example",
    "phone": "0985624856",
    "email": "example@example.com",
    "address": "Ho Chi Minh City",
    "created_by": "2",
    "is_active": true,
    "created_at": "2026-11-14T10:42:29.907Z",
    "updated_at": "2026-11-14T11:29:46.422Z"
  }
]
```

The repository filters `is_active = TRUE`; it does **not** restrict reads to the current creator.

### 3.2 GET `/api/customers?phone=0901234567`

| Field | Value |
|---|---|
| Purpose | Search an active customer by exact phone number |
| Access | Authenticated SALES or MANAGER |
| Parameters | `phone`: required for search, exactly 10 digits beginning with `0` |
| Request body | None |
| Success | `200 OK` – single customer object |
| Errors | `400 INVALID_CUSTOMER_DATA`, `404 CUSTOMER_NOT_FOUND`, `401 UNAUTHORIZED`, `500` |

**Request example:** `GET /api/customers?phone=0901234567` with a Bearer JWT.

**Example response (`200`)**

```json
{
  "customer_id": "3",
  "full_name": "Nguyen Van A",
  "phone": "0901234567",
  "email": "nguyenvana@example.com",
  "address": "Ho Chi Minh City",
  "created_by": "1",
  "is_active": true,
  "created_at": "2026-11-13T16:14:43.865Z",
  "updated_at": "2026-11-13T16:14:43.865Z"
}
```

**Example validation error (`400`)**

```json
{
  "error": "INVALID_CUSTOMER_DATA",
  "message": "Số điện thoại không hợp lệ."
}
```

An empty `phone=` value is treated as an invalid supplied parameter by the current customer route.

### 3.3 GET `/api/customers/:id`

| Field | Value |
|---|---|
| Purpose | Retrieve a single active customer |
| Access | Authenticated SALES or MANAGER |
| Parameters | `id`: customer ID in the URL |
| Request body | None |
| Success | `200 OK` – customer object as in §3 |
| Errors | `401 UNAUTHORIZED`, `404 CUSTOMER_NOT_FOUND`, `500` |

**Request example:** `GET /api/customers/6` with a Bearer JWT.

**Example response (`200`)**

```json
{
  "customer_id": "6",
  "full_name": "Nguyen Van Example",
  "phone": "0985624856",
  "email": "example@example.com",
  "address": "Ho Chi Minh City",
  "created_by": "2",
  "is_active": true,
  "created_at": "2026-11-14T10:42:29.907Z",
  "updated_at": "2026-11-14T11:29:46.422Z"
}
```

**Example error (`404`)**: `{"error":"CUSTOMER_NOT_FOUND"}`.

### 3.4 POST `/api/customers`

| Field | Value |
|---|---|
| Purpose | Create an active customer profile |
| Access | Authenticated SALES or MANAGER |
| Parameters | None |
| Request body | `full_name`, `phone` required; `email`, `address` optional |
| Success | `201 Created` – created customer object |
| Errors | `400 INVALID_CUSTOMER_DATA`, `409 PHONE_ALREADY_EXISTS`, `401 UNAUTHORIZED`, `500` |

**Request example**

```json
{
  "full_name": "Nguyen Van Example",
  "phone": "0909999888",
  "email": "example@example.com",
  "address": "Ho Chi Minh City"
}
```

**Example response (`201`)**

```json
{
  "customer_id": "7",
  "full_name": "Nguyen Van Example",
  "phone": "0909999888",
  "email": "example@example.com",
  "address": "Ho Chi Minh City",
  "created_by": "1",
  "is_active": true,
  "created_at": "2026-11-14T12:00:00.000Z",
  "updated_at": "2026-11-14T12:00:00.000Z"
}
```

`created_by` is **not** a client-controlled request field: the route sets it from `req.user.user_id`. `full_name` must not be blank, and `phone` must match `^0\d{9}$` and be unique among active customers, as enforced by the current service and database constraints.

### 3.5 PATCH `/api/customers/:id`

| Field | Value |
|---|---|
| Purpose | Update an existing active customer profile |
| Access | SALES owner or any MANAGER; JWT required |
| Parameters | `id`: customer ID in the URL |
| Request body | Current implementation expects `full_name`, `phone`, `email`, `address` values (full form, not guaranteed partial updates) |
| Success | `200 OK` – updated customer object |
| Errors | `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 CUSTOMER_NOT_FOUND`, `409 PHONE_ALREADY_EXISTS`, `500` |

**Request example:** `PATCH /api/customers/6`

```json
{
  "full_name": "Nguyen Van Example Updated",
  "phone": "0985624856",
  "email": "example@example.com",
  "address": "Ho Chi Minh City"
}
```

**Example response (`200`)**

```json
{
  "customer_id": "6",
  "full_name": "Nguyen Van Example Updated",
  "phone": "0985624856",
  "email": "example@example.com",
  "address": "Ho Chi Minh City",
  "created_by": "2",
  "is_active": true,
  "created_at": "2026-11-14T10:42:29.907Z",
  "updated_at": "2026-11-14T12:05:00.000Z"
}
```

**Example forbidden response (`403`)**

```json
{
  "error": "FORBIDDEN",
  "message": "Bạn không có quyền thay đổi hồ sơ này."
}
```

### 3.6 DELETE `/api/customers/:id`

| Field | Value |
|---|---|
| Purpose | Soft-delete a customer by setting `is_active = FALSE` |
| Access | SALES owner or any MANAGER; JWT required |
| Parameters | `id`: customer ID in the URL |
| Request body | None |
| Success | `200 OK` – message plus deactivated customer |
| Errors | `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 CUSTOMER_NOT_FOUND`, `500` |

**Request example:** `DELETE /api/customers/6` with a Bearer JWT.

**Example response (`200`)**

```json
{
  "message": "CUSTOMER_DEACTIVATED",
  "customer": {
    "customer_id": "6",
    "full_name": "Nguyen Van Example",
    "phone": "0985624856",
    "email": "example@example.com",
    "address": "Ho Chi Minh City",
    "created_by": "2",
    "is_active": false,
    "created_at": "2026-11-14T10:42:29.907Z",
    "updated_at": "2026-11-14T12:10:00.000Z"
  }
}
```

## 4. Duplicate Detection

All duplicate endpoints require a JWT. The current routes do not require the MANAGER role for scanning or deleting pending candidates.

### 4.1 GET `/api/duplicates`

| Field | Value |
|---|---|
| Purpose | List duplicate candidate pairs associated with two active customers |
| Access | Authenticated SALES or MANAGER |
| Parameters | None |
| Request body | None |
| Success | `200 OK` – JSON array |
| Errors | `401 UNAUTHORIZED`, `500 INTERNAL_SERVER_ERROR` |

**Request example:** `GET /api/duplicates` with a Bearer JWT.

**Example response (`200`)** (selected database columns; the actual response also includes the other aliased customer fields)

```json
[
  {
    "candidate_id": "1",
    "customer_id_1": "4",
    "customer_id_2": "5",
    "status": "PENDING",
    "detected_at": "2026-11-14T10:00:00.000Z",
    "reviewed_by": null,
    "customer_1_name": "Nguyen Van Test",
    "customer_1_phone": "0901111222",
    "customer_1_email": "test.a@example.com",
    "customer_1_address": "Ca Mau",
    "customer_2_name": "Nguyen Van Tet",
    "customer_2_phone": "0901111333",
    "customer_2_email": "test.b@example.com",
    "customer_2_address": "Ca Mau"
  }
]
```

### 4.2 POST `/api/duplicates/scan`

| Field | Value |
|---|---|
| Purpose | Scan active profiles, detect likely duplicates and insert new candidate pairs |
| Access | Authenticated SALES or MANAGER |
| Parameters | None |
| Request body | None |
| Success | `200 OK` |
| Errors | `401 UNAUTHORIZED`, `500 DUPLICATE_SCAN_FAILED` |

**Request example:** `POST /api/duplicates/scan` with a Bearer JWT; no request body.

**Example response (`200`)** (keys are exact; counts depend on database)

```json
{
  "message": "Quét hồ sơ nghi trùng thành công.",
  "total_customers": 6,
  "detected_pairs": 1,
  "new_pairs": 0
}
```

Duplicate detection uses exact matching of nonempty email, or name similarity of at least `0.8` combined with the first seven phone digits, or equal normalized name and address (with minimum lengths). An already recorded pair is not inserted again, even with reversed customer ordering.

### 4.3 GET `/api/duplicates/:id`

| Field | Value |
|---|---|
| Purpose | Retrieve one candidate plus both customer profiles for comparison |
| Access | Authenticated SALES or MANAGER |
| Parameters | `id`: positive integer candidate ID |
| Request body | None |
| Success | `200 OK` |
| Errors | `401 UNAUTHORIZED`, `400 INVALID_CANDIDATE_ID`, `404 CANDIDATE_NOT_FOUND`, `500` |

**Request example:** `GET /api/duplicates/1` with a Bearer JWT.

**Example response (`200`)** (illustrative subset: `SELECT dc.*` can include additional candidate columns)

```json
{
  "candidate_id": "1",
  "customer_id_1": "4",
  "customer_id_2": "5",
  "status": "PENDING",
  "customer_1": {
    "customer_id": "4",
    "full_name": "Nguyen Van Test",
    "phone": "0901111222",
    "is_active": true,
    "created_by": "1"
  },
  "customer_2": {
    "customer_id": "5",
    "full_name": "Nguyen Van Tet",
    "phone": "0901111333",
    "is_active": true,
    "created_by": "1"
  }
}
```

### 4.4 DELETE `/api/duplicates/:id`

| Field | Value |
|---|---|
| Purpose | Delete an unprocessed (`PENDING`) duplicate candidate record |
| Access | Authenticated SALES or MANAGER |
| Parameters | `id`: positive integer candidate ID |
| Request body | None |
| Success | `200 OK` |
| Errors | `401 UNAUTHORIZED`, `400 INVALID_CANDIDATE_ID`, `404 CANDIDATE_NOT_FOUND`, `409 CANDIDATE_ALREADY_PROCESSED`, `500` |

**Request example:** `DELETE /api/duplicates/1` with a Bearer JWT.

**Example response (`200`)**

```json
{
  "message": "Đã xóa cặp hồ sơ nghi trùng.",
  "candidate_id": "1"
}
```

A previously merged/processed candidate is not deleted and returns `409`.

## 5. Customer Merge

### 5.1 POST `/api/merges`

| Field | Value |
|---|---|
| Purpose | Merge a pending duplicate pair into a selected primary profile |
| Access | MANAGER only; JWT required |
| Parameters | None |
| Request body | `candidate_id`, `primary_customer_id`, `manager_confirmed: true`, `selected_data` |
| Success | `200 OK` – merge result and updated primary customer |
| Errors | `401 UNAUTHORIZED`, `403 FORBIDDEN` / `MANAGER_NOT_FOUND`, `400` validation errors, `404 CANDIDATE_NOT_FOUND`, `409` conflict errors, `500` |

**Request example**

```json
{
  "candidate_id": 4,
  "primary_customer_id": 4,
  "manager_confirmed": true,
  "selected_data": {
    "full_name": "Nguyen Van Test",
    "phone": "0901111222",
    "email": "test.a@example.com",
    "address": "Ca Mau"
  }
}
```

`primary_customer_id` must refer to one of the two customers in the pending candidate. `manager_id` is **not** supplied by the client; it is read from `req.user.user_id`. The selected full name must be nonempty and no longer than 120 characters; phone must match `^0\d{9}$`; optional email and address have service-level validation.

**Example successful response (`200`)** (illustrative fields based on `merge.repository.js`; exact `merge` columns depend on the database table)

```json
{
  "message": "Gộp hồ sơ thành công.",
  "merge": {
    "primary_customer_id": "4",
    "duplicate_customer_id": "5",
    "merged_by": "2"
  },
  "customer": {
    "customer_id": "4",
    "full_name": "Nguyen Van Test",
    "phone": "0901111222",
    "email": "test.a@example.com",
    "address": "Ca Mau",
    "is_active": true
  }
}
```

**Error codes mapped by the route:**

| Status | Codes |
|---|---|
| `400` | `MANAGER_CONFIRMATION_REQUIRED`, `INVALID_MANAGER_ID`, `INVALID_CUSTOMER_ID`, `INVALID_MERGE_DATA`, `INVALID_FULL_NAME`, `INVALID_PHONE`, `INVALID_PRIMARY_CUSTOMER` |
| `401` | `UNAUTHORIZED` (missing/invalid token) |
| `403` | `FORBIDDEN`, `MANAGER_NOT_FOUND` |
| `404` | `CANDIDATE_NOT_FOUND` |
| `409` | `CANDIDATE_ALREADY_PROCESSED`, `CUSTOMER_NOT_ACTIVE`, `PHONE_ALREADY_EXISTS` |
| `500` | `INTERNAL_SERVER_ERROR` |

The repository uses a PostgreSQL transaction: `BEGIN`, row locks (`FOR UPDATE`), updating the primary record, deactivating the duplicate, writing `customer_merge`, marking the candidate `MERGED`, and `COMMIT`. Failures trigger `ROLLBACK`.

## 6. Health Check

### 6.1 GET `/health`

| Field | Value |
|---|---|
| Purpose | Confirm the HTTP application is responding |
| Access | Public |
| Parameters | None |
| Request body | None |
| Success | `200 OK` |
| Errors | Network/server unavailable (not the same as an API validation error) |

**Request example:** `GET http://localhost:8080/health`

**Response (`200`)**

```json
{
  "status": "ok"
}
```

A successful response does not independently prove database connectivity.

## 7. Authentication and Authorization Rules

| Operation | No JWT | SALES | MANAGER |
|---|---|---|---|
| `POST /api/auth/login` | Allowed | Allowed | Allowed |
| Customer `GET` / search | 401 | Allowed | Allowed |
| `POST /api/customers` | 401 | Allowed | Allowed |
| `PATCH /api/customers/:id` | 401 | Own records only | Allowed |
| `DELETE /api/customers/:id` | 401 | Own records only | Allowed |
| Duplicate list / detail / scan / delete | 401 | Allowed | Allowed |
| `POST /api/merges` | 401 | 403 | Allowed |
| `GET /health` | Allowed | Allowed | Allowed |

**Ownership check:** for customer updates and deactivation, the authorization middleware reads the record and compares `created_by` to the authenticated user's ID for SALES. MANAGER bypasses this ownership restriction. Older records without an owner are not editable by SALES under the current implementation.

**Typical errors**

```json
{
  "error": "UNAUTHORIZED",
  "message": "Vui lòng đăng nhập để tiếp tục."
}
```

```json
{
  "error": "FORBIDDEN",
  "message": "Bạn không có quyền thay đổi hồ sơ này."
}
```

```json
{
  "error": "CUSTOMER_NOT_FOUND",
  "message": "Không tìm thấy hồ sơ khách hàng."
}
```

## 8. Verification and Known Limitations

**Verified development results (14 November 2026)**

| Check | Observed result |
|---|---|
| Backend automated suite | 17 passed; 0 failed |
| Frontend production build | Successful |
| Docker deployment | `db`, `app`, `frontend` healthy |
| `GET /api/customers` without JWT | HTTP 401 |
| SALES user `1` PATCH customer `6`, created by user `2` | HTTP 403 |
| Customer `6` before/after forbidden PATCH | Data unchanged |
| MANAGER PATCH customer `6` | HTTP 200 |

**Evidence:** `docs/screenshots/bt3-security/`, `docs/screenshots/bt3-docker/`, and `docs/test-report.md`. Earlier clean-clone proof recorded 16 passing tests; the current 17-test revision still requires its own final clean-clone verification.

**Limits:** Some automated tests mock repositories and services. Real-database DELETE authorization and concurrent-modification cases were not separately verified. Current reads of customer and duplicate data are available to any authenticated SALES/MANAGER account; ownership is only enforced for customer updates/deactivation. The duplicate scan/delete actions also have no MANAGER-only restriction in the inspected routes. This document records implemented behavior, not a comprehensive security certification.

**Reference implementation inspected:** `src/routes/{auth,customer,duplicate,merge}.routes.js`, `src/services/{auth,customer,duplicate,duplicate-detection,merge}.service.js`, `src/repositories/{customer,duplicate,merge}.repository.js`, and `src/middleware/{auth,customer-authorization}.middleware.js`.
