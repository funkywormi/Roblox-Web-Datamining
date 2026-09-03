import ready from "../../util/ready";
import realtimeDebugger from "./debugger";

type RealTimeSettings = { IsDebuggerEnabled?: string };

if (typeof document !== "undefined") {
  ready(() => {
    const { RealTimeSettings } = window.Roblox as typeof window.Roblox & {
      RealTimeSettings?: RealTimeSettings;
    };
    if (RealTimeSettings && RealTimeSettings.IsDebuggerEnabled === "True") {
      realtimeDebugger.debuggerInit();
    }
  });
}
