export const PromptEntryPoint = {
  CommunityPageOpen: "CommunityPageOpen",
  HomepageLaunchWeb: "HomepageLaunchWeb",
} as const;
export type PromptEntryPoint = (typeof PromptEntryPoint)[keyof typeof PromptEntryPoint];

export const INLINE_PROMPT_ENTRY_POINTS = [
  PromptEntryPoint.CommunityPageOpen,
  PromptEntryPoint.HomepageLaunchWeb,
] as const;
export type InlinePromptEntryPoint = (typeof INLINE_PROMPT_ENTRY_POINTS)[number];

export const GLOBAL_PROMPT_ENTRY_POINTS = [PromptEntryPoint.HomepageLaunchWeb] as const;
export type GlobalPromptEntryPoint = (typeof GLOBAL_PROMPT_ENTRY_POINTS)[number];
