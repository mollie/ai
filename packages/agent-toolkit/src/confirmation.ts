import type { ToolName } from "./types.js";

/** A write tool call awaiting approval before it executes. */
export interface ConfirmationRequest {
  /** The name of the tool about to execute, e.g. "create_refund". */
  tool: ToolName;
  /** The raw params the tool was called with. */
  params: unknown;
}

export interface ConfirmationResult {
  approved: boolean;
  /** Optional reason for a denial, surfaced in the thrown error. */
  reason?: string;
}

export type RequireConfirmation = (
  request: ConfirmationRequest,
) => Promise<ConfirmationResult>;

/** Thrown when a `requireConfirmation` hook denies a write-tool call. */
export class MollieAgentToolkitConfirmationDeniedError extends Error {
  constructor(tool: ToolName, reason?: string) {
    super(`Write action "${tool}" was not confirmed${reason ? `: ${reason}.` : "."}`);
    this.name = "MollieAgentToolkitConfirmationDeniedError";
  }
}

/**
 * Runs the `requireConfirmation` hook for a write tool, if one is configured,
 * and throws `MollieAgentToolkitConfirmationDeniedError` if it denies the call.
 * No-ops when `requireConfirmation` is undefined (opt-in, backwards compatible).
 */
export async function assertConfirmed(
  requireConfirmation: RequireConfirmation | undefined,
  request: ConfirmationRequest,
): Promise<void> {
  if (!requireConfirmation) {
    return;
  }

  const result = await requireConfirmation(request);
  if (!result.approved) {
    throw new MollieAgentToolkitConfirmationDeniedError(request.tool, result.reason);
  }
}
