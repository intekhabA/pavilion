# Security Architecture & Hardening Guide

## 1. Authentication & Credential Storage

- **Password Hashing**: Stored using `bcrypt` (12 salt rounds) with zero plaintext persistence.
- **Account Lockout Policy**: After 5 consecutive failed login attempts, the account is locked for 15 minutes. All attempts are recorded in `login_history` with IP address and user-agent string.
- **Password Complexity Rules**: Enforced via regex requiring minimum 8 characters, at least one uppercase letter, one lowercase letter, one digit, and one special character.

---

## 2. JWT & Refresh Token Rotation

- Short-lived Access Tokens (60 minutes) containing user ID and role claim.
- Long-lived Refresh Tokens (14 days) stored as SHA-256 hashes in the database.
- **Strict Rotation**: Every token refresh revokes the existing refresh token and generates a new pair.
- **Replay Attack Detection**: If a previously revoked refresh token is presented, all active sessions for that user account are automatically revoked, and an alert is recorded in the audit log.

---

## 3. Server-Side RBAC Enforcement

Permissions are validated on every protected API endpoint on the backend:
```python
@router.post("", dependencies=[Depends(require_permission("projects.create"))])
def create_project(...):
```
Client-side UI permissions are only for UX convenience; authorization bypass via direct API requests is strictly prevented.

---

## 4. Anti-Bot Lead Protection & Rate Limiting

- **Anti-Bot Honeypots**: Hidden form inputs that are invisible to real users but filled by automated web crawlers. Any lead submission containing data in the honeypot field is rejected.
- **Redis Sliding-Window Rate Limiting**:
  - `POST /auth/login`: 5 requests / minute / IP
  - `POST /enquiries`: 5 requests / minute / IP
  - General API: 120 requests / minute / IP
  - Admin endpoints: 300 requests / minute / IP

---

## 5. File Upload & Media Hardening

- **MIME & Extension Whitelisting**: Strictly allows `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` for images, and `.pdf`, `.doc`, `.docx` for documents.
- **Binary Signature Verification**: Disallows files beginning with executable magic headers (`MZ`, `\x7fELF`).
- **File Re-encoding**: Uploaded images are opened in memory with PIL, validated, optimized, and re-saved as sanitized WebP and JPEG files with randomized UUID filenames, stripping all malicious EXIF metadata.
- **Upload Size Limit**: Enforced at 10MB for images and 25MB for documents at both Nginx proxy and FastAPI middleware.

---

## 6. HTTP Security Headers

The following headers are returned on all HTTP responses:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `Content-Security-Policy`: Restricts resource execution to trusted origins and YouTube embed iframes.
- `Strict-Transport-Security`: `max-age=31536000; includeSubDomains; preload` in production.

---

## 7. Tamper-Evident Audit Logging

All administrative operations (logins, logouts, project creations, modifications, publish states, and permission updates) are recorded in the `audit_logs` table with timestamp, operator ID, IP address, user-agent, and sanitized JSON diffs. All sensitive credentials, tokens, and authorization headers are scrubbed prior to storage.
