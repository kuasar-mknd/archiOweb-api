## 2025-01-27 - Unauthenticated PII Exposure in User Profile
**Vulnerability:** `GET /api/users/:id` allowed unauthenticated access to user email and birthdate.
**Learning:** Service layer methods fetching DTOs/View Models should be context-aware (know who is asking) to apply field-level security filtering.
**Prevention:** Ensure all "get by id" endpoints verify if the requester has permission to see ALL fields, or implement a "public view" filter.
