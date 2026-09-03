import { DialogBody, DialogTitle } from "@rbx/foundation-ui";
import { useDialogRestrictionModel } from "./useDialogRestrictionModel";
import DialogTitleSkeleton from "./DialogTitleSkeleton";
import DialogContentSkeleton from "./DialogContentSkeleton";
import DialogErrorState from "./DialogErrorState";
import DialogInterventionDetails from "./DialogInterventionDetails";
import DialogInterventionActions from "./DialogInterventionActions";
import type { Overrides } from "../../types/runtimeOptions";

interface Props {
  onDismiss: () => void;
  overrides?: Overrides;
  onAppeal?: () => void;
  showAppealSnackbar: () => void;
  translationsReady: boolean;
}

/**
 * Self-contained body for the Universal Feature Restriction dialog.
 *
 * It runs {@link useDialogRestrictionModel} and switches on its status: a loading skeleton while the
 * moderation detail is fetched or translations load, a dismissible error state when the detail can't
 * be loaded (so the dialog doesn't crash), and — when ready — the inline title plus the composed
 * details (scrollable middle) and actions (pinned bottom).
 */
const DialogContentView = ({
  onDismiss,
  overrides,
  onAppeal,
  showAppealSnackbar,
  translationsReady,
}: Props) => {
  const model = useDialogRestrictionModel({ overrides, onAppeal, translationsReady });

  if (model.status === "loading") {
    return (
      <DialogBody className="flex flex-col gap-medium">
        <DialogTitle className="margin-none">
          <DialogTitleSkeleton />
        </DialogTitle>
        <DialogContentSkeleton />
      </DialogBody>
    );
  }

  if (model.status === "error") {
    return (
      <DialogBody className="flex flex-col gap-medium">
        <DialogErrorState onDismiss={onDismiss} />
      </DialogBody>
    );
  }

  const { view, mountTimeMs } = model;

  return (
    <DialogBody className="flex flex-col gap-medium">
      <DialogTitle className="text-heading-medium margin-none">{view.title}</DialogTitle>
      <div className="flex flex-col gap-medium height-full min-height-0">
        <DialogInterventionDetails
          view={view}
          onAppealsRedirect={overrides?.onAppealsRedirect}
          mountTimeMs={mountTimeMs}
          onAppeal={onAppeal}
          showAppealSnackbar={showAppealSnackbar}
          onDismiss={onDismiss}
        />

        <div className="shrink-0">
          <DialogInterventionActions
            onDismiss={onDismiss}
            analytics={view.analytics}
            dsaMessage={view.dsaMessage}
            mountTimeMs={mountTimeMs}
          />
        </div>
      </div>
    </DialogBody>
  );
};

export default DialogContentView;
