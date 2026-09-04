import type { PromptEntry } from "../../common/types/promptTypes";
import { type OverlayRenderer, sduiOverlayRenderers, type SduiOverlayRenderer } from "../types";

const sduiOverlayRendererSet = new Set<OverlayRenderer>(sduiOverlayRenderers);

const REQUIRED_SDUI_PROMPT_ENTRY_FIELDS = [
  "config",
  "identifier",
  "robloxComponentType",
  "title",
] as const satisfies readonly (keyof PromptEntry)[];

type RequiredSduiPromptEntryField = (typeof REQUIRED_SDUI_PROMPT_ENTRY_FIELDS)[number];
type ValidSduiPromptEntry = PromptEntry & Required<Pick<PromptEntry, RequiredSduiPromptEntryField>>;

export const getMissingSduiPromptEntryFields = (promptEntry: PromptEntry | undefined) =>
  REQUIRED_SDUI_PROMPT_ENTRY_FIELDS.filter(field => promptEntry?.[field] === undefined);

export const isValidSduiPromptEntry = (
  promptEntry: PromptEntry | undefined,
): promptEntry is ValidSduiPromptEntry =>
  REQUIRED_SDUI_PROMPT_ENTRY_FIELDS.every(field => promptEntry?.[field] !== undefined);

export const isSduiOverlayPrompt = <T extends { renderer: OverlayRenderer }>(
  prompt: T,
): prompt is Extract<T, { renderer: SduiOverlayRenderer }> =>
  sduiOverlayRendererSet.has(prompt.renderer);
