import ixp from "@rbx/experimentation";
import { gameJoinDeeplinkLayerName, gameJoinDeeplinkEnabledKey } from "./deferredDeeplinkConstants";
import buildLaunchContext from "./launchContextEncoder";
import fireGameJoinDeeplinkCounter from "./gameJoinDeeplinkTelemetry";

const isGameJoinDeeplinkEnabled = async (): Promise<boolean> => {
  try {
    const values = await ixp.getAllValuesForLayer(gameJoinDeeplinkLayerName);
    // Logged before reading the parameter so both arms record exposure at the same step.
    ixp.logLayerExposure(gameJoinDeeplinkLayerName);
    return values[gameJoinDeeplinkEnabledKey] === true;
  } catch {
    return false;
  }
};

const resolveLaunchContext = async (
  placeLauncherUrl?: string,
  launchExp?: string,
  referredByPlayerId?: number | string,
): Promise<string | undefined> => {
  const launchContext = buildLaunchContext(placeLauncherUrl ?? "", launchExp, referredByPlayerId);
  if (launchContext == null) {
    fireGameJoinDeeplinkCounter("noLaunchContext");
    return undefined;
  }
  if (!(await isGameJoinDeeplinkEnabled())) {
    fireGameJoinDeeplinkCounter("ixpOff");
    return undefined;
  }
  return launchContext;
};

export { isGameJoinDeeplinkEnabled };
export default resolveLaunchContext;
