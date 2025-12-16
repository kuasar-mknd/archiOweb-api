# Bolt's Journal

## 2025-01-26 - Mongoose Populate vs Direct Query
**Learning:** Using `populate()` on a parent document that stores an array of child ObjectIds (e.g., `Garden.plants`) can be significantly slower and less robust than querying the child collection directly (e.g., `Plant.find({ garden: id })`), especially if the parent array is not strictly maintained (stale IDs) or grows large.
**Action:** Prefer `ChildModel.find({ parent: parentId })` over `ParentModel.findById(parentId).populate('children')` when an index exists on the foreign key in the child model.
