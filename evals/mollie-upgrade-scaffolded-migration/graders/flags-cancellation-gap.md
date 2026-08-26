---
type: llm
weight: 1
---

The response must explicitly identify that partial-line cancellation (cancelling one
item after ordering) has no direct equivalent in the Payments API - the
release-authorization endpoint only releases the full remaining authorized amount,
not a per-line amount. It must flag this as a design decision for the developer
(e.g. proposing to defer the release to final capture, or another concrete
approach) rather than silently writing code that pretends per-line cancellation
still works the same way, and rather than ignoring the cancellation requirement
entirely.
