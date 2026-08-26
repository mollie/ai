---
type: llm
weight: 1
---

Since the same key succeeds on SOME calls, the response should reason that the key
itself is unlikely to be universally invalid, and should raise at least one specific
alternative cause: 401-vs-403 confusion, inconsistent key delivery across
instances/environments, a test/live key mismatch on a subset of code paths, or
(for Connect/OAuth) a per-client access token expiring or being revoked. A response
that just says "double check your API key is correct" with no further reasoning
should fail this grader.
