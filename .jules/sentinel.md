# Sentinel's Journal

## 2025-02-18 - Unauthenticated Garden Enumeration
**Vulnerability:** `GET /api/gardens` allowed unauthenticated users to list all gardens and their locations, enabling mass enumeration and potential privacy leaks of user locations.
**Learning:** Even "public" listing endpoints can leak sensitive aggregate data or metadata (like locations of all users). Default to secure/private, and explicitly design public interfaces.
**Prevention:** Apply authentication middleware (`verifyToken`) to all list endpoints by default.

## 2025-02-17 - Broken Access Control on Garden Details
**Vulnerability:** `GET /api/gardens/:id` was unauthenticated and returned garden details including populated plant data. This bypassed the access control on `listPlantsInGarden`, allowing any user (or unauthenticated person) to view plants in any garden.
**Learning:** When an endpoint populates related data (like `populate('plants')`), it must enforce the strictest access control applicable to that related data.
**Prevention:** Always verify authorization (ownership) when retrieving resources by ID, especially when sensitive sub-resources are included.

## 2025-01-27 - Unauthenticated PII Exposure in User Profile
**Vulnerability:** `GET /api/users/:id` allowed unauthenticated access to user email and birthdate.
**Learning:** Service layer methods fetching DTOs/View Models should be context-aware (know who is asking) to apply field-level security filtering.
**Prevention:** Ensure all "get by id" endpoints verify if the requester has permission to see ALL fields, or implement a "public view" filter.

## 2025-01-29 - User Enumeration via Timing Attack
**Vulnerability:** `authenticateUser` returned immediately if the user was not found, while performing a slow bcrypt comparison if the user existed. This allowed attackers to enumerate valid email addresses based on response time.
**Learning:** Short-circuit evaluation in authentication logic can introduce timing side channels.
**Prevention:** Always perform the same amount of work (e.g., hash comparison) regardless of whether the user exists or not.

## 2025-02-18 - Excessive Data Exposure in Plant List
**Vulnerability:** `GET /api/plants` allowed any authenticated user to list ALL plants in the database, including those from private gardens of other users. This was due to `plantService.getAllPlants` returning `Plant.find()` without filtering.
**Learning:** List endpoints in a multi-tenant application must always be filtered by the user's context/ownership. Implicit "public by default" for collections is dangerous. Also discovered that running large test suites can trigger rate limits, causing false positives in tests.
**Prevention:** Pass the requesting user context to all service methods and enforce ownership filters (e.g. `user: req.user.id` or `garden: { $in: userGardenIds }`). Disable rate limiting in test environments.

## 2025-02-19 - Broken Access Control on Plant Details
**Vulnerability:** `GET /api/plants/:id` allowed any authenticated user to retrieve details of any plant by ID, regardless of ownership. This was an IDOR (Insecure Direct Object Reference) vulnerability.
**Learning:** Checking authentication (`verifyToken`) is not enough. Authorization (ownership check) is required for every resource access, especially when accessing by ID. Service methods often defaulted to just returning the object found by ID without checking if the requester owns it.
**Prevention:** In `getPlantById`, explicitly verify if `req.user` is the owner of the garden containing the plant (or is admin) before returning the plant.
