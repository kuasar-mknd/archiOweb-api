## 2025-01-27 - Unauthenticated PII Exposure in User Profile
**Vulnerability:** `GET /api/users/:id` allowed unauthenticated access to user email and birthdate.
**Learning:** Service layer methods fetching DTOs/View Models should be context-aware (know who is asking) to apply field-level security filtering.
**Prevention:** Ensure all "get by id" endpoints verify if the requester has permission to see ALL fields, or implement a "public view" filter.

## 2025-01-29 - User Enumeration via Timing Attack
**Vulnerability:** `authenticateUser` returned immediately if the user was not found, while performing a slow bcrypt comparison if the user existed. This allowed attackers to enumerate valid email addresses based on response time.
**Learning:** Short-circuit evaluation in authentication logic can introduce timing side channels.
**Prevention:** Always perform the same amount of work (e.g., hash comparison) regardless of whether the user exists or not.
