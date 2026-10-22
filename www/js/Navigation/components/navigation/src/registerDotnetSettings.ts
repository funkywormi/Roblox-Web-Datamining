import { AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import { logoutUser, openAccountSwitcher } from "./util/authUtil";
import { registerNavCapabilities } from "./util/navCapabilities";

registerNavCapabilities({
  getStoredAccountSwitcherBlob: () => AccountSwitcherService.getStoredAccountSwitcherBlob(),
  syncAccountSwitcherBlobIfNeeded: () => AccountSwitcherService.syncAccountSwitcherBlobIfNeeded(),
  openAccountSwitcher,
  logoutUser,
});
