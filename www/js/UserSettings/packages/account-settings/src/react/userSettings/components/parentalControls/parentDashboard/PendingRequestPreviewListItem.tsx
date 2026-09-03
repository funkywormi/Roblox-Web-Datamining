import { Intl } from "Roblox";
import React from "react";
import { Button } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { UserProfileField, useUserProfiles } from "@rbx/user-profile-api-client";
import { IconButton, ListItem, type TListItemDivider } from "@rbx/foundation-ui";
import useCancelConsentRequestModal from "../../../../common/hooks/modals/useCancelConsentRequestModal";
import {
  ParentConsentType,
  PunishmentType,
  RestrictionType,
  TConsentResponse,
  TransferType,
} from "../../../../../types/parentConsentsTypes";
import { getFirstSettingNameInConsentData } from "../../../utils/parentalControls/parentalConsentUtils";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { getConsentDetailsPageUrl } from "../../../constants/urlConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import {
  getRequestSettingHeading,
  requestSettingHeadings,
} from "../../../constants/contentConstants/consentTranslationConstants";

const PendingRequestPreviewListItem = ({
  consent,
  isChildSide,
  experienceName,
  canSeeChatTerminology = false,
  divider = "None",
}: {
  consent: TConsentResponse;
  isChildSide: boolean;
  experienceName?: string;
  canSeeChatTerminology?: boolean;
  divider?: TListItemDivider;
}): JSX.Element => {
  const { translate } = useTranslation();
  const intl = new Intl();

  const { parentalConsents } = parentalControlsTranslationConstants;

  const userProfileFields = [UserProfileField.Names.CombinedName];
  const consentTargetUserId =
    consent?.consentData?.friendUserId || consent?.consentData?.targetUserId || 0;
  const { data: userProfiles } = useUserProfiles([consentTargetUserId], userProfileFields);

  const getConsentTitle = () => {
    switch (consent?.consentType) {
      case ParentConsentType.UpdateBirthdate:
        return translate(requestSettingHeadings.birthday);
      case ParentConsentType.UpdateUserSetting: {
        // Return the name of the first setting we find in the consent data
        const settingName = getFirstSettingNameInConsentData(consent);
        const settingNameTranslationKey = getRequestSettingHeading(
          settingName as keyof typeof requestSettingHeadings,
          canSeeChatTerminology,
        );
        if (settingNameTranslationKey) {
          return translate(settingNameTranslationKey);
        }
        return settingName;
      }
      case ParentConsentType.LiftPunishment: {
        if (consent?.consentData?.punishmentType === PunishmentType.Chargeback) {
          return translate(requestSettingHeadings.chargebackUnlock);
        }
        return consent?.consentType;
      }
      case ParentConsentType.ManageFriend: {
        const displayName = consent?.consentData?.friendUserId
          ? (userProfiles?.[consent.consentData.friendUserId]?.names?.combinedName ?? "")
          : "";
        return translate(requestSettingHeadings.unblockUser, {
          displayName,
        });
      }
      case ParentConsentType.AddTrustedConnection: {
        const username = consent?.consentData?.targetUserId
          ? (userProfiles?.[consent.consentData.targetUserId]?.names?.combinedName ?? "")
          : "";
        return translate(requestSettingHeadings.addTrustedConnection, {
          username,
        });
      }
      case ParentConsentType.ManageExperience: {
        return translate(requestSettingHeadings.unblockExperience, {
          experienceName,
        });
      }
      case ParentConsentType.ReceiveTransfer: {
        if (consent?.consentData?.transferType === TransferType.Robux) {
          return translate(requestSettingHeadings.receiveRobuxTransfer);
        }
        return consent?.consentType;
      }
      case ParentConsentType.SendTransfer: {
        if (consent?.consentData?.transferType === TransferType.Robux) {
          return translate(requestSettingHeadings.sendRobuxTransfer);
        }
        return consent?.consentType;
      }
      case ParentConsentType.LiftRestriction: {
        if (consent?.consentData?.restrictionType === RestrictionType.PlatformAccess) {
          return translate(requestSettingHeadings.liftPlatformAccessRestriction);
        }
        return consent?.consentType;
      }
      default:
        return consent?.consentType;
    }
  };

  const getButtonText = () => {
    if (
      consent?.consentType === ParentConsentType.LiftRestriction &&
      consent?.consentData?.restrictionType === RestrictionType.PlatformAccess
    ) {
      return translate(commonTranslationConstants.approve);
    }
    return translate(commonTranslationConstants.review);
  };

  // Modal for revoking consent request
  const [cancelConsentRequestModal, cancelConsentRequestModalService] =
    useCancelConsentRequestModal({
      pendingConsent: consent,
      translatedBody: <p>{translate(parentalConsents.cancelRequestDescription)}</p>,
    });

  const openRequestDetailsPage = () => {
    const consentId = consent.id;
    const consentDetailsUrl = getConsentDetailsPageUrl(consentId);
    window.location.href = consentDetailsUrl;
  };

  const formattedCreatedTime = consent.createdTime
    ? intl.getDateTimeFormatter().getFullDate(consent.createdTime)
    : undefined;

  return (
    <React.Fragment>
      {isChildSide ? (
        <ListItem
          isContained={false}
          size="Medium"
          divider={divider}
          title={getConsentTitle()}
          metadata={formattedCreatedTime}
          trailing={
            <IconButton
              icon="icon-regular-trash-can"
              variant="Utility"
              size="Small"
              ariaLabel={translate(commonTranslationConstants.cancel)}
              onClick={() => {
                cancelConsentRequestModalService.open();
              }}
            />
          }
        />
      ) : (
        <div className="settings-list-item-container">
          <div className="settings-list-item-info">
            <span className="setting-name font-body">{getConsentTitle()}</span>
            {formattedCreatedTime && (
              <span className="text-description">{formattedCreatedTime}</span>
            )}
          </div>
          <Button
            size={Button.sizes.small}
            variant={Button.variants.secondary}
            onClick={openRequestDetailsPage}
          >
            {getButtonText()}
          </Button>
        </div>
      )}
      {cancelConsentRequestModal}
    </React.Fragment>
  );
};

export default PendingRequestPreviewListItem;
