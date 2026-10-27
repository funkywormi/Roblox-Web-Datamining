import "@rbx/core-scripts/global";
import { window } from "@rbx/core-lib/browser";
import { startAccessManagementUpsell } from "@rbx/www-common/access-management-upsell";
import type { AccessManagementUpsellParams } from "@rbx/www-common/access-management-upsell";

const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

export type StartAccessManagementUpsell = (
  params: AccessManagementUpsellParams,
) => Promise<boolean>;

// On .NET the AccessManagementUpsellV2 SCC loads only when IsAccessManagementWidgetEnabled, so this can be undefined there.
export const getStartAccessManagementUpsell = (): StartAccessManagementUpsell | undefined => {
  if (isNextJs) {
    return startAccessManagementUpsell;
  }
  const service = window?.Roblox.AccessManagementUpsellV2Service;
  return service && (params => service.startAccessManagementUpsell(params));
};
