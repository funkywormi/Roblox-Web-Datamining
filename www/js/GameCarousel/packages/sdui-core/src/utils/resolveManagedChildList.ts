import type { SduiManagedChildList } from "../types";
import { isSduiManagedChildList } from "./typeGuards";

/**
 * Returns `explicitManagedChildList` when that value is a managed child list,
 * such as `feedItems`. Otherwise returns `injectedManagedChildren` when the
 * renderer injected one as `sduiManagedChildren`. Plain React nodes are skipped
 * so the caller can render those itself.
 */
export function resolveManagedChildList(
  explicitManagedChildList: unknown,
  injectedManagedChildren: unknown,
): SduiManagedChildList | undefined {
  if (isSduiManagedChildList(explicitManagedChildList)) {
    return explicitManagedChildList;
  }
  if (isSduiManagedChildList(injectedManagedChildren)) {
    return injectedManagedChildren;
  }
  return undefined;
}
