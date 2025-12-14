# Sentinel's Journal

## 2025-02-17 - Broken Access Control on Garden Details
**Vulnerability:** `GET /api/gardens/:id` was unauthenticated and returned garden details including populated plant data. This bypassed the access control on `listPlantsInGarden`, allowing any user (or unauthenticated person) to view plants in any garden.
**Learning:** When an endpoint populates related data (like `populate('plants')`), it must enforce the strictest access control applicable to that related data.
**Prevention:** Always verify authorization (ownership) when retrieving resources by ID, especially when sensitive sub-resources are included.
