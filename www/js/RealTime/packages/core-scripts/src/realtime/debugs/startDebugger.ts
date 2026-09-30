import ready from "../../util/ready";
import { getRealtimeGlobals } from "../lib/realtimeConfig";
import realtimeDebugger from "./debugger";

type RealTimeSettings = { IsDebuggerEnabled?: string };

if (typeof document !== "undefined") {
  ready(() => {
    const { RealTimeSettings } = getRealtimeGlobals() as {
      RealTimeSettings?: RealTimeSettings;
    };
    if (RealTimeSettings && RealTimeSettings.IsDebuggerEnabled === "True") {
      realtimeDebugger.debuggerInit();
    }
  });
}
