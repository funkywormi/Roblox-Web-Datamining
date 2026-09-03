import {
  logCmntyEntrypointClickEvent,
  logCmntyEntrypointExposureEvent,
  mintEntrypointImpressionId,
} from "@rbx/community-telemetry";

// GRPS-3058/3059: attaches exposure + click telemetry to the server-rendered EDP creator byline.

// @rbx/community-telemetry does not export these enums; each surface owns its own literals.
const CONTEXT = "edp";
const ENTRY_POINT = "edp";
const ENTRY_POINT_DETAIL = "creatorByline";

const BYLINE_SELECTOR = '.game-creator a[data-creator-type="Group"][data-community-id]';

const INSTRUMENTED_FLAG = "grpsBylineInstrumented";

// No-ops for user-hosted / non-group EDPs (byline absent). Idempotent.
const baseInstrumentCreatorByline = (): void => {
  if (typeof document === "undefined") {
    return;
  }

  const link = document.querySelector<HTMLElement>(BYLINE_SELECTOR);
  if (!link) {
    return;
  }

  if (link.dataset[INSTRUMENTED_FLAG] === "true") {
    return;
  }

  const communityId = link.getAttribute("data-community-id");
  const groupId = communityId ? Number(communityId) : NaN;
  if (!Number.isFinite(groupId) || groupId <= 0) {
    return;
  }

  // Mark instrumented only once we're actually going to instrument.
  link.dataset[INSTRUMENTED_FLAG] = "true";

  // One id shared by exposure + click; imperative mint since this runs outside React.
  const entrypointImpressionId = mintEntrypointImpressionId();

  const pageRoute = window.location.pathname;

  const logExposure = (): void => {
    logCmntyEntrypointExposureEvent({
      context: CONTEXT,
      entryPoint: ENTRY_POINT,
      entryPointDetail: ENTRY_POINT_DETAIL,
      entrypointImpressionId,
      groupId,
      pageRoute,
    });
  };

  const logClick = (): void => {
    logCmntyEntrypointClickEvent({
      context: CONTEXT,
      entryPoint: ENTRY_POINT,
      entryPointDetail: ENTRY_POINT_DETAIL,
      entrypointImpressionId,
      groupId,
      pageRoute,
    });
  };

  if (typeof IntersectionObserver === "function") {
    let hasFiredExposure = false;
    const observer = new IntersectionObserver(entries => {
      if (hasFiredExposure) {
        return;
      }
      if (entries.some(entry => entry.isIntersecting)) {
        hasFiredExposure = true;
        observer.disconnect();
        logExposure();
      }
    });
    observer.observe(link);
  } else {
    // Environments without IntersectionObserver still get an exposure signal.
    logExposure();
  }

  // Fire-once click for a clean 1:1 funnel with the exposure (guards against rapid-click spam).
  link.addEventListener("click", logClick, { once: true });
};

const instrumentCreatorByline = (): void => {
  try {
    baseInstrumentCreatorByline();
  } catch {
    // Telemetry must never break EDP render.
  }
};

export default instrumentCreatorByline;
