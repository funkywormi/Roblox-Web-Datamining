import { UserSetting } from "@rbx/user-settings";
import parentalControlsConstants from "../constants/parentalControls/parentalControlsConstants";

export type TEnableBackLinkInterruptEvent = {
  onAction: () => void;
  settingName: UserSetting;
};

// Used to enable a modal interrupting when the user clicks the back link
// The onAction is called when the user clicks the modal action button
export const enableBackLinkInterrupt = (onAction: () => any, settingName: UserSetting): void => {
  const event = new CustomEvent<TEnableBackLinkInterruptEvent>(
    parentalControlsConstants.enableBackLinkInterruptEventName,
    {
      detail: {
        onAction,
        settingName,
      },
    },
  );
  window.dispatchEvent(event);
};

export const disableBackLinkInterrupt = (): void => {
  const event = new CustomEvent(parentalControlsConstants.disableBackLinkInterruptEventName);
  window.dispatchEvent(event);
};
