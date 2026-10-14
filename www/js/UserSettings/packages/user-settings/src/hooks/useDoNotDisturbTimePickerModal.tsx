import React from "react";
import { useDoNotDisturbTimeSelector } from "./useDoNotDisturbTimeSelector";
import { useSettingsModal, type IModalService } from "./useSettingsModal";
import type { TTimePickerModalProps } from "./useTimePickerModal";

export type TDoNotDisturbTimePickerModalProps = TTimePickerModalProps & { isDisabled?: boolean };

export function useDoNotDisturbTimePickerModal({
  titleText,
  bodyText,
  actionButtonText,
  cancelButtonText,
  closeLabel,
  onAction,
  initTimeMinutes,
  invalidTimeMinutes,
  errorText,
  isDisabled = false,
  ...labels
}: TDoNotDisturbTimePickerModalProps): [React.JSX.Element, IModalService] {
  const { selectedMinutes, timeSelector, resetTime } = useDoNotDisturbTimeSelector(
    initTimeMinutes,
    labels,
  );
  const isTimeInvalid = selectedMinutes === invalidTimeMinutes;

  return useSettingsModal({
    translatedTitle: titleText,
    translatedBody: (
      <React.Fragment>
        {bodyText && <span>{bodyText}</span>}
        {timeSelector}
        {isTimeInvalid && errorText && (
          // Wrap within the dialog without contributing to its intrinsic width.
          <span
            className="content-system-alert text-body-small width-0 min-width-full [overflow-wrap:anywhere]"
            role="alert"
          >
            {errorText}
          </span>
        )}
      </React.Fragment>
    ),
    translatedActionButtonText: actionButtonText,
    translatedSecondaryButtonText: cancelButtonText,
    translatedCloseLabel: closeLabel,
    disableActionButton: isDisabled || isTimeInvalid,
    onAction: () => {
      // eslint-disable-next-line no-void
      void onAction(selectedMinutes);
    },
    onDismiss: resetTime,
    size: "Medium",
  });
}
