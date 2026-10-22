import {
  logCmntyEntrypointClickEvent,
  logCmntyEntrypointExposureEvent,
  useEntrypointImpressionId,
} from "@rbx/community-telemetry";

const LEFT_NAV_CONTEXT = "leftNav";
const LEFT_NAV_ENTRY_POINT = "leftNav";

export const useCommunitiesEntrypointTelemetry = () => {
  const entrypointImpressionId = useEntrypointImpressionId();
  return {
    onExpose: () => {
      logCmntyEntrypointExposureEvent({
        context: LEFT_NAV_CONTEXT,
        entryPoint: LEFT_NAV_ENTRY_POINT,
        entrypointImpressionId,
      });
    },
    onClick: () => {
      logCmntyEntrypointClickEvent({
        context: LEFT_NAV_CONTEXT,
        entryPoint: LEFT_NAV_ENTRY_POINT,
        entrypointImpressionId,
      });
    },
  };
};
