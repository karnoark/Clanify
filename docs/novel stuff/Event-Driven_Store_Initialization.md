## What Problem Does This Solve?

Apps often need to load multiple stores (e.g., user authentication, settings, database cache) before the app can fully function.
However:

- Some stores depend on others (e.g., user data depends on authentication).
- Stores can fail to initialize, requiring retries.
- We need to track store initialization status (e.g., loading, success, failure).
- Initialization order must be correct to prevent race conditions.
