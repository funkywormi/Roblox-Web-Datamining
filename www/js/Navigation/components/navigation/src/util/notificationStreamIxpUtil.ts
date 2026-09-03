import ExperimentationService from "@rbx/experimentation";

const NOTIFICATION_STREAM_LAYER_NAME = "Notifications.StreamNotificationUXExposure";

// The server sets data-react-stream-experiment-enabled only when the arm was resolved by IXP (the
// user is enrolled), so a present-and-True value is the "log exposure for this user" gate. The
// render decision itself stays on the synchronous data-react-* flags; this is telemetry only.
const isNotificationStreamIxpEnabled = (): boolean => {
  const dataset = document.querySelector<HTMLMetaElement>(
    'meta[name="notification-stream-migration-data"]',
  )?.dataset;
  return dataset?.reactStreamExperimentEnabled === "True";
};

// Fired when the stream renders (popover open), for both arms. logLayerExposure no-ops for
// unassigned units, and the hint gate keeps the fetch off users who are not in the experiment.
export const logNotificationStreamExposureIfEnabled = (): void => {
  if (!isNotificationStreamIxpEnabled()) {
    return;
  }
  ExperimentationService.getAllValuesForLayer(NOTIFICATION_STREAM_LAYER_NAME)
    .then(() => {
      ExperimentationService.logLayerExposure(NOTIFICATION_STREAM_LAYER_NAME);
    })
    .catch(() => undefined);
};
