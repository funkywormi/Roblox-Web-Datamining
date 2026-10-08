import React, { useCallback } from "react";
import { useTranslations } from "@rbx/www-common/i18n";
import { Icon, Tooltip, TooltipTrigger } from "@rbx/foundation-ui";
import { reportAXError } from "../../utils/axAnalyticsService";
import AvatarScalingScale from "./AvatarScalingScale";
import avatarConstants from "../../constants/avatarConstants";
import { AvatarType, Scales, ScalesKeys } from "../../constants/types";
import AvatarAPIService from "../../services/avatarAPIService";
import AvatarBodyTypeToggle from "../AvatarBodyTypeToggle";
import LoadingSpinner from "../LoadingSpinner";
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

function AvatarScaling({ scales, updateScale }: AvatarScalingProps): React.ReactElement {
  const translate = useTranslations("Feature.Avatar");
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
      <h4 className="scaling-info flex items-center gap-xsmall text-heading-small">
        {translate("Heading.Scaling")}
        <Tooltip position="top-center" title={translate("Message.SelectEnableScaling")}>
          <TooltipTrigger asChild>
            <Icon name="icon-regular-circle-i" size="Small" className="cursor-pointer" />
          </TooltipTrigger>
        </Tooltip>
      </h4>
      <div className="avatar-type-container">
        <div className="text-label content-default">{translate("Label.BodyType")}</div>

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

      {!pageLoaded && <LoadingSpinner />}

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
