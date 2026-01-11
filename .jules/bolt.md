# Bolt's Journal

## 2025-01-26 - Mongoose Populate vs Direct Query
**Learning:** Using `populate()` on a parent document that stores an array of child ObjectIds (e.g., `Garden.plants`) can be significantly slower and less robust than querying the child collection directly (e.g., `Plant.find({ garden: id })`), especially if the parent array is not strictly maintained (stale IDs) or grows large.
**Action:** Prefer `ChildModel.find({ parent: parentId })` over `ParentModel.findById(parentId).populate('children')` when an index exists on the foreign key in the child model.

## 2025-01-26 - Mongoose Lean for Read Operations
**Learning:** Using `.lean()` on Mongoose `find` queries significantly reduces overhead (verified ~30% faster in micro-benchmark) by skipping document hydration. This is safe for this project as there are no global `toJSON` virtuals or critical instance methods used in the Controller layer for list responses.
**Action:** Always use `.lean()` for read-only `find` operations in Service layer, especially for list endpoints.

## 2025-01-26 - Parallel Existence Checks
**Learning:** When needing to verify a parent document exists while fetching its children (without `populate`), using `Promise.all([Parent.exists(id), Child.find({parent: id})])` is faster than sequential awaits. `Model.exists()` is extremely lightweight (index scan) compared to `findById()`.
**Action:** Use parallel `Promise.all` pattern for independent async operations like existence checks and data retrieval.

## 2025-01-26 - Redundant Array Updates
**Learning:** Maintaining arrays of child ObjectIds on parent documents (e.g., `User.gardens`, `Garden.plants`) causes unnecessary write operations and potential unbound array growth. Removing these updates saved ~15-25% time per creation operation in benchmarks.
**Action:** Do not push child IDs to parent arrays during creation. Rely on foreign key queries (e.g., `Garden.find({ user: userId })`) instead.

## 2025-01-26 - Mongoose Lean for Single Document Fetch
**Learning:** Using `.lean()` even for single document retrieval (`findById(id).lean()`) avoids hydration overhead (verified ~39% faster) and returns a POJO directly. This eliminates the need for `.toObject()` before property deletion/filtering.
**Action:** Use `.lean()` for all read-only operations, including single document fetches, when the resulting document is primarily used for returning JSON responses.
