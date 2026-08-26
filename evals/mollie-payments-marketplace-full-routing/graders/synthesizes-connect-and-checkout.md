---
type: llm
weight: 1
---

The response must correctly synthesize BOTH dimensions of this request, not just
one: (1) Mollie Connect specifics - using the seller's OAuth access token (not the
platform's own API key) and an application fee for the platform's commission - and
(2) one-time hosted checkout - a 303 redirect to the checkout URL and webhook-based
status verification (respond 200 first, don't trust the redirect alone). Also
testmode should be reflected somewhere since the developer said they're in test
mode. A response that only addresses Connect onboarding OR only addresses checkout
mechanics, without connecting the two, should fail this grader.
