export const PromptStyle = {
  CardContainer: "CardContainer",
  InlineBanner: "InlineBanner",
  Modal: "Modal",
  SurfaceBanner: "SurfaceBanner",
} as const;
export type PromptStyle = (typeof PromptStyle)[keyof typeof PromptStyle];

export const INLINE_PROMPT_STYLES = [PromptStyle.CardContainer, PromptStyle.InlineBanner] as const;
export type InlinePromptStyle = (typeof INLINE_PROMPT_STYLES)[number];

export const GLOBAL_PROMPT_STYLES = [PromptStyle.Modal, PromptStyle.SurfaceBanner] as const;
export type GlobalPromptStyle = (typeof GLOBAL_PROMPT_STYLES)[number];
