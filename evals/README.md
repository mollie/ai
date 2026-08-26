# Skill eval suite

Behavioral test cases for `mollie-payments`, `mollie-upgrade`, and
`mollie-agent-toolkit`, on top of the structural checks in
`ci/validate-structure.mjs`. Every case here was manually run and verified against
the current skills on 2026-08-25/26 before being written down (see each case's
`description`/`expected_outcome` for what was actually observed).

## CI: what's live today vs. still dormant

This suite is split into two tiers, on purpose — LLM evals cost real API spend
per run and are non-deterministic, which makes them a bad fit for a blocking
merge gate:

- **Structural gate — live, blocking, every MR.** `ci/validate-structure.mjs`
  (runs in the `validate-structure` job, `.gitlab-ci.yml`) now also validates
  every case here: frontmatter/`case.yaml` keys against the schema below,
  grader `type`/keys, that `pattern`/`input_match` regexes actually compile,
  that a `scaffold_script` reference resolves, and that every
  `<references/...>` / `<other-skill:references/...>` link in the skills
  themselves points at a real file. Free, deterministic, catches drift and
  typos immediately — no model call involved.
- **Behavioral suite — scaffolded, not yet live.** The `eval-suite-scheduled`
  job (stage `eval`) only fires on a GitLab CI schedule
  (`$CI_PIPELINE_SOURCE == "schedule"`, `allow_failure: true`) and runs
  `ci/run-scheduled-evals.sh`, which does both the cross-tool replay below and
  attempts `claude plugin eval`. **It won't produce real signal yet**: the
  GitLab CI schedule trigger itself still needs to be created in project
  settings (Settings → CI/CD → Schedules — recommend nightly to start) by
  someone with maintainer access; `claude plugin eval` is still early-access
  gated (the job detects this and logs a clean SKIPPED line rather than
  failing); and none of `codex`, `cursor-agent`, or `gemini` is installed or
  authenticated in the `node:22` CI image, so the cross-tool replay will report
  all-skipped until that's added. Results land as job artifacts
  (`evals/results.json`, `evals/report.html`, `evals/cross-tool-results.json`),
  kept 30 days, regardless of the job's pass/fail color — check those, not the
  green/red status.

## Running (once `claude plugin eval` is enabled)

`claude plugin eval` is early-access-gated and was **not enabled** in the session
these cases were authored in — see `claude plugin eval --help`'s "Availability and
enablement" notes, or ask your Anthropic contact for the enablement variable if you
hit `` `plugin eval` is currently in early access ``. Once enabled, from the repo
root:

```bash
claude plugin eval . --json evals/results.json --report evals/report.html --no-publish
```

The `mollie-upgrade-scaffolded-migration` case seeds a fake file via
`context.scaffold_script` and needs `--scaffold` explicitly:

```bash
claude plugin eval . --case mollie-upgrade-scaffolded-migration --scaffold
```

Cost note: a single run of the most expensive case (cold cache) was ~$2.50; most
runs are $0.20–$0.90. With the default `runs: 3` and the `with-without` ablation
arm, budget for real spend — pilot with `--runs 1 --ablation none` first.

## Running today (harness gated) — manual fallback

Each `prompt.md` body is a plain prompt you can replay by hand with the same
mechanism the harness uses internally (`claude -p --plugin-dir <path>`):

```bash
claude -p --output-format stream-json --verbose --max-turns 8 \
  --permission-mode dontAsk --setting-sources user \
  --plugin-dir "$PWD" \
  "$(sed -n '/^---$/,/^---$/!p' evals/<case-name>/prompt.md)"
```

Then check the trace (`jq` or a small Python loop over the JSONL lines) for a
`Skill` tool_use matching the case's `graders/skill-activated.md` `input_match`, and
read the final assistant text against the `llm` graders' criteria by eye. For
`mollie-upgrade-scaffolded-migration`, run `bash scaffold.sh` in a scratch directory
first and use that as the working directory.

## Cases

| Case | Tests |
|---|---|
| `mollie-payments-refunds-activation` | Basic activation + write-action-safety framing |
| `mollie-upgrade-activation` | Basic activation; doesn't fabricate migration steps with no code present |
| `mollie-agent-toolkit-activation` | Basic activation; asks which framework (Step 1) |
| `mollie-agent-toolkit-prompt-only-confirmation` | Adversarial: rejects "system prompt is enough" |
| `mollie-agent-toolkit-all-tools-recall` | **Known limitation** — bare "ALL_TOOLS" with zero Mollie context doesn't activate. See description for the 2026-08-26 tuning attempt that fixed this but broke precision (reverted). |
| `mollie-agent-toolkit-all-tools-precision-guard` | Sibling guard: an explicitly non-Mollie "ALL_TOOLS" question must NOT activate this skill. Caught the regression above — keep alongside the recall case whenever the description changes. |
| `mollie-agent-toolkit-prompt-injection` | Adversarial: recognizes injected refund instruction, prescribes validation + confirmation gate |
| `mollie-payments-apikey-in-frontend` | Adversarial: refuses live key in frontend |
| `mollie-payments-trust-redirect` | Adversarial: insists on status verification over trusting the redirect |
| `mollie-payments-webhook-response-order` | Adversarial: corrects 200-before-fulfillment ordering |
| `mollie-payments-webhook-not-received` | Reference coverage: `troubleshooting/webhook-issues.md` |
| `mollie-payments-intermittent-401` | Reference coverage: `troubleshooting/credentials-and-auth.md` |
| `mollie-payments-chargeback-filed` | Reference coverage: `operations/chargebacks-and-settlements.md`, read-only correctness |
| `mollie-agent-toolkit-captures-not-exposed` | Reference coverage: toolkit gap + safety carryover to custom tools |
| `mollie-payments-marketplace-full-routing` | Deep routing: Connect + hosted checkout + webhooks synthesized together |
| `mollie-payments-refund-orders-api-handoff` | Cross-skill boundary: refund-on-Orders-API routes to `mollie-upgrade` |
| `mollie-upgrade-scaffolded-migration` | Real seeded code; must flag the partial-cancellation gap rather than approximate it |

The last two "deep routing" cases were manually verified as true multi-turn
conversations (3 and 2 turns) but are encoded here as single combined prompts,
since `claude plugin eval`'s `context.history_file` multi-turn mechanism wasn't
verified end-to-end in this environment (the harness was gated). If/when
multi-turn authoring is confirmed, converting these two is the natural next step.

## Cross-tool: Codex, Cursor, and Gemini CLI

`ci/run-cross-tool-evals.mjs` replays this same prompt corpus against `codex
exec`, `cursor-agent -p`, and `gemini -p`, in addition to Claude:

```bash
node ci/run-cross-tool-evals.mjs                          # all three tools, all cases
node ci/run-cross-tool-evals.mjs --case "mollie-payments-*" --tools codex
node ci/run-cross-tool-evals.mjs --tools gemini
node ci/run-cross-tool-evals.mjs --json evals/cross-tool-results.json
```

**Status: UNVERIFIED against the real CLIs — with one exception (Gemini's
invocation shape).** None of `codex`, `cursor-agent`, or `gemini` was installed
in the environment this was authored in — the script's *plumbing* (case
discovery, temp-workspace staging, scaffold execution, output capture, regex
grading, graceful skip/error handling) was smoke-tested against fake stand-in
binaries for all three and works correctly, but nothing has actually run against
a real model yet:

- **Codex**: stages `skills/` into `.agents/skills/` in a temp workspace (Codex's
  documented Agent Skills discovery path — real installs get this from
  `.codex-plugin/plugin.json`'s `"skills"` field via the plugin installer, which
  this script doesn't replicate). Runs `codex exec ... -o <file>` and reads the
  final message from that file. **Guessed, not doc-confirmed** — verify the
  flags on first real run.
- **Cursor**: copies the whole plugin checkout (`skills/`, `.cursor-plugin/`,
  `.cursor/`, `.mcp.json`) into a temp workspace, since Cursor's exact
  skill-discovery path wasn't confirmed against current docs. Runs
  `cursor-agent -p ... --output-format json` and reads `.result`. **Guessed, not
  doc-confirmed.**
- **Gemini CLI**: stages `skills/` into `.agents/skills/` — the *same* directory
  Codex uses. This one is **doc-confirmed** (geminicli.com/docs/cli/headless,
  geminicli.com/docs/cli/skills, checked 2026-08-26): Gemini CLI's headless mode
  is triggered by `-p "<prompt>"`, `--output-format json` returns
  `{ response, stats }`, and its skill-discovery precedence explicitly lists
  `.agents/skills/` as a workspace tier (taking precedence over `.gemini/skills/`
  when both exist), on top of built-in and extension-bundled skills. One real
  caveat from the same docs: `--output-format json` exits nonzero on *any*
  tool-call error, even non-fatal ones the model would otherwise recover from in
  plain-text mode — so a nonzero exit from Gemini in this script's output may
  mean "one tool call hiccuped," not "the skill failed." Check `stderr`/raw
  stdout in the JSON output before concluding the skill itself is broken.
- **Grading**: `regex`-type graders run for real (they're plain text matches,
  portable across tools). `tool_used: Skill` graders are approximated by a
  keyword-mention heuristic on the raw output — weaker evidence than Claude's
  actual Skill-tool trace event, and it can read as a false ABSENT even when the
  skill activated, if the model just doesn't name it verbatim. `llm`-type
  graders are NOT re-implemented (that would mean wiring a second judge model);
  their criteria and the response are printed for manual review instead.
- Binaries not on `PATH` are skipped, not failed — safe to run in CI or locally
  without any of these tools installed. The script always exits 0 regardless of
  per-case errors (it's a report, not a gate) — decide on a pass/fail threshold
  once real output has validated the grading logic.

First real run with any of these CLIs installed should be treated as testing
*this script*, not just the skills — fix assumptions here if the output shapes
don't match. Codex and Cursor's command shapes are still unverified guesses;
Gemini's are doc-confirmed but still never actually executed against the real
binary, so authentication/output-shape surprises are still possible there too.
