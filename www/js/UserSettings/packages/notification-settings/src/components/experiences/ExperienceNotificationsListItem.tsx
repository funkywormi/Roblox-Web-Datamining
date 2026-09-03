import React, { JSX, useCallback, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { useSnackbar } from "@rbx/user-settings";
import translationConstants from "../../constants/translationConstants";
import { getGamePageUrl } from "../../constants/urlConstants";
import { useConfirmationModal } from "../../hooks/useConfirmationModal";
import type { MyExperienceRow } from "../../hooks/useMyExperiencesData";
import experiencePreferencesService from "../../services/experiencePreferencesService";
import { ThumbnailNotificationsToggle } from "../ThumbnailNotificationsToggle";

type ExperienceNotificationsListItemProps = {
  row: MyExperienceRow;
  description: string;
  onToggled: (universeId: number, enabled: boolean) => void;
};

export const ExperienceNotificationsListItem = ({
  row,
  description,
  onToggled,
}: ExperienceNotificationsListItemProps): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const [updating, setUpdating] = useState(false);

  const toggle = useCallback(
    async (enabled: boolean) => {
      setUpdating(true);
      try {
        if (enabled) {
          await experiencePreferencesService.enableExperienceFollowing(row.universeId);
        } else {
          await experiencePreferencesService.disableExperienceFollowing(row.universeId);
        }
        onToggled(row.universeId, enabled);
        snackbarService.success(translate(translationConstants.savedSuccessfully));
      } catch {
        snackbarService.warning(translate(translationConstants.unknownError));
      } finally {
        setUpdating(false);
      }
    },
    [row.universeId, onToggled, snackbarService, translate],
  );

  const [confirmationModal, confirmationModalService] = useConfirmationModal({
    titleText: translate(translationConstants.areYouSureHeading),
    bodyComponent: (
      <p className="text-body-medium">
        {translate(translationConstants.confirmTurnOffExperienceNotificationsBody, {
          experienceName: row.name,
        })}
      </p>
    ),
    actionButtonText: translate(translationConstants.actionConfirm),
    neutralButtonText: translate(translationConstants.actionCancel),
    onAction: () => {
      toggle(false).catch(() => undefined);
    },
  });

  return (
    <React.Fragment>
      <ThumbnailNotificationsToggle
        setting={{
          targetId: row.universeId,
          name: row.name,
          description,
        }}
        isOn={row.isEnabled}
        isDisabled={updating}
        thumbnailHref={row.placeId !== null ? getGamePageUrl(row.placeId) : undefined}
        onToggle={next => {
          if (next) {
            toggle(true).catch(() => undefined);
          } else {
            confirmationModalService.open();
          }
        }}
      />
      {confirmationModal}
    </React.Fragment>
  );
};
