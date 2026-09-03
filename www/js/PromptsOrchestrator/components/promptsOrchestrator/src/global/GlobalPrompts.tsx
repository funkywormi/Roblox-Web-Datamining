import { type GlobalPromptEntryPoint } from "../common/constants/promptEntryPointConstants";
import type { ClientAttributes } from "../common/types/promptTypes";
import { useGlobalPromptsStore } from "./store/globalPromptsStore";
import {
  selectClientAttributes,
  selectEntryPoint,
} from "./store/globalPromptContext/globalPromptContextSelectors";
import { useGlobalPromptNavigation } from "./hooks/useGlobalPromptNavigation";

type BaseGlobalPromptsProps = {
  entryPoint: GlobalPromptEntryPoint;
  clientAttributes?: ClientAttributes;
};

const BaseGlobalPrompts = (_props: BaseGlobalPromptsProps) => {
  return <div data-testid="global-prompts" />;
};

// This is a wrapper around BaseGlobalPrompts that ensures the entry point is set
export const GlobalPrompts = () => {
  const entryPoint = useGlobalPromptsStore(selectEntryPoint);
  const clientAttributes = useGlobalPromptsStore(selectClientAttributes);

  useGlobalPromptNavigation();

  // Only render on supported entry points
  return entryPoint ? (
    <BaseGlobalPrompts entryPoint={entryPoint} clientAttributes={clientAttributes} />
  ) : null;
};
