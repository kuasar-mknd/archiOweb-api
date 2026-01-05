## 2025-02-21 - Broken Access Control Middleware
**Vulnerability:** The `isAdmin` middleware was hardcoded to `return true`, effectively bypassing all administrative access controls if it had been used. This created a latent high-risk vulnerability.
**Learning:** Security middleware that is "disabled for development" via commented out code or early returns can easily be forgotten and deployed to production, creating silent bypasses.
**Prevention:** Never commit code that bypasses security checks, even if "unused". Use environment variables or feature flags if temporary bypass is needed for dev, but default to secure (fail closed).
