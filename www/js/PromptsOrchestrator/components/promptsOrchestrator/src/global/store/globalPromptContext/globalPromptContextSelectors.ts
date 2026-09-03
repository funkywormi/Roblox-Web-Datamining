import type { GlobalPromptsStore } from "../globalPromptsStore";

export const selectEntryPoint = (state: GlobalPromptsStore) => state.entryPoint;

export const selectClientAttributes = (state: GlobalPromptsStore) => state.clientAttributes;

export const selectSetMatchedConfig = (state: GlobalPromptsStore) => state.setMatchedConfig;
