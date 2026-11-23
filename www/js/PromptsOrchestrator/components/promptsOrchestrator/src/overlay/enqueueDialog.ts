import { submitPrompt } from "../overlay-orchestrator/scheduler/submitPrompt";
import type { EnqueueDialogInput } from "./types";

export function enqueueDialog(input: EnqueueDialogInput): void {
  submitPrompt({ ...input, dedupePolicy: input.dedupePolicy ?? "in-flight" });
}
