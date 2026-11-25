import { ActionType, type SduiRegistryModule } from "@rbx/sdui-core";
import { openAccountSettingsActionHandler } from "./openAccountSettingsActionHandler";

/**
 * SDUI contributions for opening the account settings. Compose it alongside the shared modules
 * on any surface that can render `OpenAccountSettingsAction`.
 */
export const AccountSettingsEntryPointsSduiModule = {
  name: "account-settings-entry-points",
  actionHandlers: {
    [ActionType.OPEN_ACCOUNT_SETTINGS]: openAccountSettingsActionHandler,
  },
} satisfies SduiRegistryModule;
