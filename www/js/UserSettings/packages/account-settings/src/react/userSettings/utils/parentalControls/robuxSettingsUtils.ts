import type { TUserSettingsAndOptionsV2Body } from "@rbx/user-settings";
import type { TChildInfo } from "../../../../types/childrenInfoTypes";

/**
 * Either permission opens the Robux page, so each row checks its own, and each also needs
 * its setting to come back from user-settings. The page has nothing to show when neither does.
 */
export const getRobuxSettingsRows = (
  child: Pick<
    TChildInfo,
    "canParentManageChildRobuxTransferLimits" | "canParentManageChildRobuxTransferSettings"
  >,
  childSettingsV2: TUserSettingsAndOptionsV2Body | undefined,
): { showTransferLimits: boolean; showApprovals: boolean } => ({
  showTransferLimits:
    child.canParentManageChildRobuxTransferLimits === true &&
    childSettingsV2?.robuxTransferLimits !== undefined,
  showApprovals:
    child.canParentManageChildRobuxTransferSettings === true &&
    childSettingsV2?.robuxTransferApprovalMode !== undefined,
});
