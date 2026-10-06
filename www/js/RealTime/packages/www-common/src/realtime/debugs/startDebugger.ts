import { getRealtimeGlobals, onRealtimeConfigured } from "../lib/realtimeConfig";
import realtimeDebugger from "./debugger";

if (typeof document !== "undefined") {
  onRealtimeConfigured(() => {
    const { RealTimeSettings } = getRealtimeGlobals();
    if (RealTimeSettings && RealTimeSettings.IsDebuggerEnabled === "True") {
      realtimeDebugger.debuggerInit();
    }
  });
}
