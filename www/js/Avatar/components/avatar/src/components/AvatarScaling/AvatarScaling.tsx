import React, { useCallback } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { reportAXError } from "../../utils/axAnalyticsService";
import AvatarScalingScale from "./AvatarScalingScale";
import avatarConstants from "../../constants/avatarConstants";
import { AvatarType, Scales, ScalesKeys } from "../../constants/types";
import AvatarAPIService from "../../services/avatarAPIService";
import AvatarBodyTypeToggle from "../AvatarBodyTypeToggle";
import { R6BodyTypeWarningDialog } from "../dialogs";
import { useSystemFeedback } from "../../contexts/SystemFeedbackContext";
import { useAvatarPageContext } from "../../contexts/AvatarPageContext";
import { useAvatarEditingAccessContext } from "../../contexts/AvatarEditingAccessContext";
import parseError from "../../utils/parseErrorUtil";
import { trackAvatarEdit, AvatarEditorTrackingEvents } from "../../utils/axTracking";

interface AvatarScalingProps {
  scales: Scales;
  updateScale: (newValue: number, scaleKey: ScalesKeys) => void;
}

function AvatarScaling({ scales, updateScale }: AvatarScalingProps): JSX.Element {
  const { translate } = useTranslation();
  const systemFeedback = useSystemFeedback();
  const [isBodyTypeWarningOpen, setIsBodyTypeWarningOpen] = React.useState<boolean>(false);
  const { setAvatarType } = useAvatarPageContext();

  const updateAvatarType = useCallback(
    (newAvatarType: AvatarType) => {
      trackAvatarEdit(AvatarEditorTrackingEvents.TypeChange, { avatarType: newAvatarType });
      if (newAvatarType === "R6") {
        setIsBodyTypeWarningOpen(true);
      } else {
        AvatarAPIService.setAvatarType(newAvatarType)
          .then(() => {
            setAvatarType(newAvatarType);
          })
          .catch(e => {
            reportAXError({
              itemName: "UpdateAvatarTypeError",
              counterName: "AvatarEditorError",
              log: parseError(e),
            });

            systemFeedback.error(avatarConstants.avatarType.failedToUpdate);
          });
      }
    },
    [setAvatarType, systemFeedback],
  );

  const { avatarSettings, scaleEnabled, pageLoaded } = useAvatarPageContext();
  const { isAvatarEditingBlocked } = useAvatarEditingAccessContext();
  const isScaleEnabled = scaleEnabled && !isAvatarEditingBlocked;

  return (
    <React.Fragment>
      <R6BodyTypeWarningDialog
        closeDialog={() => {
          setIsBodyTypeWarningOpen(false);
        }}
        isOpen={isBodyTypeWarningOpen}
      />
      <h4 className="scaling-info">
        {translate("Heading.Scaling")}{" "}
        <span
          className="tooltip-container"
          data-toggle="tooltip"
          title={translate("Message.SelectEnableScaling")}
        >
          <span className="icon-moreinfo-16x16" />
        </span>
      </h4>
      <div className="avatar-type-container">
        <div className="text-label font-subheader-1">{translate("Label.BodyType")}</div>

        <div className="avatar-type-contents-container">
          {/* Avatar Type Toggle */}
          <AvatarBodyTypeToggle updateAvatarType={updateAvatarType} />

          {!scaleEnabled && pageLoaded && (
            <div className="avatar-type-message-banner">
              {translate("Message.SelectEnableScaling")}
            </div>
          )}
        </div>
      </div>

      {!pageLoaded && (
        <div className="loading-animated">
          <span className="spinner spinner-default" />
        </div>
      )}

      {pageLoaded && (
        <div className="section-sliders">
          {Object.entries(scales).map(([key, scale], index) => {
            return (
              <AvatarScalingScale
                key={`${key}-scale`}
                scaleKey={key as ScalesKeys}
                scale={scale}
                updateScale={updateScale}
                pageLoaded={pageLoaded}
                isBodyTypeScaleOutOfTab={!!avatarSettings?.isBodyTypeScaleOutOfTab}
                scaleEnabled={isScaleEnabled}
              />
            );
          })}
        </div>
      )}
    </React.Fragment>
  );
}

export default AvatarScaling;
