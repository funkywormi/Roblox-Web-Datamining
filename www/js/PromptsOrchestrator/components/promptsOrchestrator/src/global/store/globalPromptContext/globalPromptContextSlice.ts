import { type StateCreator } from "zustand";
import { shallow } from "zustand/shallow";
import type { GlobalPromptEntryPoint } from "../../../common/constants/promptEntryPointConstants";
import type { ClientAttributes } from "../../../common/types/promptTypes";
import type { MatchedGlobalPromptRouteConfig } from "../../types";

type GlobalPromptContextState =
  | {
      entryPoint: GlobalPromptEntryPoint;
      clientAttributes?: ClientAttributes;
    }
  // This is the initial state/when no config is matched
  | {
      entryPoint?: undefined;
      clientAttributes?: undefined;
    };

export type GlobalPromptContextSlice = GlobalPromptContextState & {
  setMatchedConfig: (matchedConfig?: MatchedGlobalPromptRouteConfig) => void;
};

export const createGlobalPromptContextSlice: StateCreator<
  GlobalPromptContextSlice,
  [],
  [],
  GlobalPromptContextSlice
> = set => {
  return {
    entryPoint: undefined,
    clientAttributes: undefined,
    setMatchedConfig: matchedConfig => {
      set(state => {
        if (
          state.entryPoint === matchedConfig?.entryPoint &&
          shallow(state.clientAttributes, matchedConfig?.clientAttributes)
        ) {
          return state;
        }

        return {
          entryPoint: matchedConfig?.entryPoint,
          clientAttributes: matchedConfig?.clientAttributes,
        };
      });
    },
  };
};
