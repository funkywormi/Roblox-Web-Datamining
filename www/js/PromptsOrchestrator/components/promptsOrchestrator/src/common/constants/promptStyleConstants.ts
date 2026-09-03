export const PromptStyle = {
  CardContainer: "CardContainer",
  InlineBanner: "InlineBanner",
} as const;
export type PromptStyle = (typeof PromptStyle)[keyof typeof PromptStyle];

export const INLINE_PROMPT_STYLES = [PromptStyle.CardContainer, PromptStyle.InlineBanner] as const;
export type InlinePromptStyle = (typeof INLINE_PROMPT_STYLES)[number];

// TODO: Add modal, coachmark, and surface banner as they are implemented
export const GLOBAL_PROMPT_STYLES = [] as const;
export type GlobalPromptStyle = (typeof GLOBAL_PROMPT_STYLES)[number];
