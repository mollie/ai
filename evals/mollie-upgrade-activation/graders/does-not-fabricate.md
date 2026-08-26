---
type: llm
weight: 1
---

Since this sandbox contains no actual Orders API integration code, the correct
response either (a) asks for the real codebase/files that use the Orders API before
proposing migration steps, or (b) gives accurate, general Orders→Payments migration
guidance consistent with Mollie's mollie-upgrade skill (e.g. captureMode: 'manual'
for hold-then-capture, Shipments API → Captures API, release-authorization for
cancellation, consolidated refunds). It should NOT confidently fabricate
project-specific migration steps (referencing files, variables, or a specific
codebase) that have no basis, since no code was actually provided.
