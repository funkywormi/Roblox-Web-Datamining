import { create } from "zustand";
import {
  createGlobalPromptContextSlice,
  type GlobalPromptContextSlice,
} from "./globalPromptContext/globalPromptContextSlice";

export type GlobalPromptsStore = GlobalPromptContextSlice;

export const useGlobalPromptsStore = create<GlobalPromptsStore>((...args) => ({
  ...createGlobalPromptContextSlice(...args),
}));
