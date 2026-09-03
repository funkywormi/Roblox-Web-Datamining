import React, { useMemo } from "react";
import { Button } from "react-style-guide";
import { useHistory } from "react-router-dom";
import { LegallySensitiveContentService } from "Roblox";
import { uuidService } from "core-utilities";
import { UserProfileField, useUserProfiles } from "@rbx/user-profile-api-client";
import {
  PartySettingsValue,
  EnabledStatusValue,
  TUpdateChildSettingsError,
  UpdateChildSettingsErrorCode,
  UserPrivacyLevel,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import { selectChildPagesForChildUserId } from "../../../../apis/slices/childPagesSlice";
import { useAppSelector } from "../../../../redux/hooks";
import SpendSettingName from "../../../../../enums/SpendSettingName";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import { RobuxTransfer } from "../../../../../types/robuxTransferTypes";
import { useAnswerConsentRequestMutation } from "../../../../apis/parentalControlsApi";
import {
  ConsentAnswer,
  ParentConsentType,
  PunishmentType,
  RestrictionType,
  TConsentResponse,
  TransferType,
} from "../../../../../types/parentConsentsTypes";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import {
  getFirstSettingNameInConsentData,
  getFirstSettingValueInConsentData,
} from "../../../utils/parentalControls/parentalConsentUtils";
import birthdayUtils from "../../../utils/birthdayUtils";
import {
  getRequestSettingLabel,
  getTranslatedOptionValue,
  requestSettingLabels,
} from "../../../constants/contentConstants/consentTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { useWrappedTranslation } from "../../../hooks/useWrappedTranslation";
import {
  getConsentDetailsPageUrl,
  getTrustedConnectionReviewPageUrl,
} from "../../../constants/urlConstants";

const ConsentCenterCard = ({
  child,
  consent,
  experienceName,
  robuxTransfer,
}: {
  child: TChildInfo;
  consent: TConsentResponse;
  experienceName?: string;
  robuxTransfer?: RobuxTransfer;
}): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const { snackbarService } = useSnackbar();
  const history = useHistory();
  const { parentalConsents, parentConsentsLegallySensitiveContent } =
    parentalControlsTranslationConstants;

  const [childSettings] = useGetSettingsAndOptions(consent?.childUserId);
  const [answerConsentRequest] = useAnswerConsentRequestMutation();

  const userProfileFields = [UserProfileField.Names.CombinedName];
  const consentTargetUserId =
    consent?.consentData?.friendUserId || consent?.consentData?.targetUserId || 0;
  const { data: userProfiles } = useUserProfiles([consentTargetUserId], userProfileFields);
  const displayName = useMemo(() => {
    if (consent?.consentData?.friendUserId) {
      return (
        userProfiles?.[consent.consentData.friendUserId]?.names?.combinedName ??
        consent.consentData.friendUserId
      );
    }
    if (consent?.consentData?.targetUserId) {
      return (
        userProfiles?.[consent.consentData.targetUserId]?.names?.combinedName ??
        consent.consentData.targetUserId
      );
    }
    return "";
  }, [consent, userProfiles]);

  const settingName = useMemo(() => getFirstSettingNameInConsentData(consent), [consent]);
  const sessionId = useMemo(() => uuidService.generateRandomUuid(), []);

  const actionNameTranslation: string | undefined = useMemo(() => {
    let actionNameTranslationKey: string | undefined;
    if (consent?.consentType === ParentConsentType.UpdateUserSetting) {
      actionNameTranslationKey = getRequestSettingLabel(
        settingName as keyof typeof requestSettingLabels,
        child.canSeeChatTerminology ?? false,
      );
    }
    if (consent?.consentType === ParentConsentType.UpdateBirthdate) {
      actionNameTranslationKey = requestSettingLabels.birthday;
    }
    if (
      consent?.consentType === ParentConsentType.LiftPunishment &&
      consent?.consentData?.punishmentType === PunishmentType.Chargeback
    ) {
      actionNameTranslationKey = requestSettingLabels.chargebackUnlock;
    }

    if (consent?.consentType === ParentConsentType.ManageFriend) {
      return translate(requestSettingLabels.unblockUser, {
        displayName,
      });
    }

    if (consent?.consentType === ParentConsentType.ManageExperience) {
      return translate(requestSettingLabels.unblockExperience, {
        experienceName,
      });
    }

    if (consent?.consentType === ParentConsentType.AddTrustedConnection) {
      return translate(requestSettingLabels.addTrustedConnection, {
        displayName,
      });
    }

    if (
      consent?.consentType === ParentConsentType.ReceiveTransfer &&
      consent?.consentData?.transferType === TransferType.Robux
    ) {
      return translate(requestSettingLabels.receiveRobuxTransfer, {
        username: robuxTransfer?.sender.targetDisplayName || "",
        amount:
          (robuxTransfer?.transferAmount ?? 0) - (robuxTransfer?.transferTransactionFeeAmount ?? 0),
      });
    }

    if (
      consent?.consentType === ParentConsentType.SendTransfer &&
      consent?.consentData?.transferType === TransferType.Robux
    ) {
      return translate(requestSettingLabels.sendRobuxTransfer, {
        username: robuxTransfer?.recipient.targetDisplayName || "",
        amount: robuxTransfer?.transferAmount || 0,
      });
    }

    if (consent?.consentType === ParentConsentType.LiftRestriction) {
      actionNameTranslationKey = requestSettingLabels.liftPlatformAccessRestriction;
    }

    if (actionNameTranslationKey) {
      return translate(actionNameTranslationKey);
    }
    return undefined;
  }, [
    consent,
    settingName,
    displayName,
    experienceName,
    robuxTransfer,
    child.canSeeChatTerminology,
  ]);

  const modifySettingsValueForLabel = (settingName: UserSetting, settingValue: unknown) => {
    if (settingName === UserSetting.whoCanPartyWithMe) {
      return (settingValue as PartySettingsValue) === PartySettingsValue.AllConnections
        ? EnabledStatusValue.Enabled
        : EnabledStatusValue.Disabled;
    }
    if (
      settingName === UserSetting.whoCanChatWithMeInExperiences ||
      settingName === UserSetting.whoCanWhisperChatWithMeInExperiences
    ) {
      settingValue =
        (settingValue as UserPrivacyLevel) === UserPrivacyLevel.AllUsers
          ? EnabledStatusValue.Enabled
          : EnabledStatusValue.Disabled;
    }
    return settingValue;
  };

  const getCurrentValue = (): string => {
    switch (consent?.consentType) {
      case ParentConsentType.UpdateBirthdate:
        return birthdayUtils.formatBirthdateFromISO(child.birthDate);
      case ParentConsentType.UpdateUserSetting: {
        if (childSettings && settingName) {
          const currValue = childSettings[settingName as keyof typeof childSettings]?.currentValue;
          const labelCorrectedSettingValue = modifySettingsValueForLabel(settingName, currValue);
          return getTranslatedOptionValue(labelCorrectedSettingValue, translate);
        }
        return "";
      }
      default:
        return "";
    }
  };

  const getProposedValue = (): string => {
    switch (consent?.consentType) {
      case ParentConsentType.UpdateBirthdate:
        return birthdayUtils.formatBirthdateFromISO(consent?.consentData?.newBirthdate || "");
      case ParentConsentType.UpdateUserSetting: {
        // Return the value for the first setting we find in the consent data
        const settingName = getFirstSettingNameInConsentData(consent);
        const settingValue = getFirstSettingValueInConsentData(consent);
        if (!settingName) return "";
        const labelCorrectedSettingValue = modifySettingsValueForLabel(settingName, settingValue);
        return getTranslatedOptionValue(labelCorrectedSettingValue, translate);
      }
      default:
        return "";
    }
  };

  const getLegallySensitiveActionConsentNameAndTranslationArgs = (): [
    string | undefined,
    Record<string, unknown> | undefined,
  ] => {
    if (!consent || !actionNameTranslation) return [undefined, undefined];

    if (
      (consent.consentType === ParentConsentType.LiftPunishment &&
        consent?.consentData?.punishmentType === PunishmentType.Chargeback) ||
      consent.consentType === ParentConsentType.ManageFriend ||
      consent.consentType === ParentConsentType.ManageExperience ||
      consent.consentType === ParentConsentType.AddTrustedConnection ||
      consent.consentType === ParentConsentType.ReceiveTransfer ||
      consent.consentType === ParentConsentType.SendTransfer ||
      (consent.consentType === ParentConsentType.LiftRestriction &&
        consent?.consentData?.restrictionType === RestrictionType.PlatformAccess)
    ) {
      // Allow your child to {actionName}
      return [
        parentConsentsLegallySensitiveContent.consentCenterAllowActionConsentName,
        { actionName: `<b>${actionNameTranslation}</b>` },
      ];
    }

    switch (settingName) {
      case UserSetting.monthlySpendLimit:
      case UserSetting.dailyScreenTimeLimit:
        // Update your child's {settingName}
        return [
          parentConsentsLegallySensitiveContent.consentCenterUpdateSettingNoValueConsentName,
          { settingName: `<b>${actionNameTranslation}</b>` },
        ];

      case UserSetting.enablePurchases:
      case UserSetting.allowFacialAgeEstimation:
        // Allow your child to {actionName}
        return [
          parentConsentsLegallySensitiveContent.consentCenterAllowActionConsentName,
          { actionName: `<b>${actionNameTranslation}</b>` },
        ];

      default: {
        const currentValue = getCurrentValue();
        const proposedValue = getProposedValue();
        if (!currentValue || !proposedValue) {
          // Unknown setting name or value
          return [undefined, undefined];
        }

        // Update your child's {settingName} from {currentValue} to {proposedValue}
        return [
          parentConsentsLegallySensitiveContent.consentCenterUpdateSettingWithValueConsentName,
          {
            settingName: `<b>${actionNameTranslation}</b>`,
            currentValue: currentValue,
            proposedValue: `<b>${proposedValue}</b>`,
          },
        ];
      }
    }
  };

  const [legallySensitiveConsentName, legallySensitiveTranslationArgs] =
    getLegallySensitiveActionConsentNameAndTranslationArgs();

  const [legallySensitiveContent, legallySensitiveActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      legallySensitiveConsentName ?? "",
      parentConsentsLegallySensitiveContent.legallySensitiveConsentSurfaceName,
      legallySensitiveTranslationArgs ?? undefined,
    );

  const getText = (): JSX.Element | undefined => {
    if (!consent || !actionNameTranslation) return undefined;
    if (!legallySensitiveContent) return undefined;
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: legallySensitiveContent.wordsOfConsent.text ?? "",
        }}
      />
    );
  };

  const getSuccessMessage = (answer: ConsentAnswer): string => {
    const approved = answer === ConsentAnswer.Approve;

    switch (consent?.consentType) {
      case ParentConsentType.LiftPunishment: {
        if (consent?.consentData?.punishmentType === PunishmentType.Chargeback) {
          return approved
            ? translate(parentalConsents.childAccountUnlocked)
            : translate(parentalConsents.childAccountUnlockDenied);
        }
        break;
      }
      case ParentConsentType.UpdateUserSetting:
        if (settingName === UserSetting.enablePurchases) {
          return approved
            ? translate(parentalConsents.childPurchasesApproved)
            : translate(parentalConsents.childPurchasesDenied);
        }
        break;
      case ParentConsentType.ManageFriend: {
        return approved
          ? translate(parentalConsents.userUnblockApproved, {
              displayName,
            })
          : translate(parentalConsents.userUnblockDenied, {
              displayName,
            });
      }
      case ParentConsentType.ManageExperience: {
        return approved
          ? translate(parentalConsents.experienceUnblockApproved, {
              experienceName,
            })
          : translate(parentalConsents.experienceUnblockDenied, {
              experienceName,
            });
      }
      case ParentConsentType.AddTrustedConnection: {
        return approved
          ? translate(parentalConsents.trustedConnectionAddApproved, {
              displayName,
            })
          : translate(parentalConsents.trustedConnectionAddDenied, {
              displayName,
            });
      }
      default:
      // continue below
    }

    if (actionNameTranslation) {
      return approved
        ? translate(parentalConsents.childSettingUpdated, { settingName: actionNameTranslation })
        : translate(parentalConsents.childSettingNotUpdated, {
            settingName: actionNameTranslation,
          });
    }

    // generic fallback messages
    return approved
      ? translate(parentalConsents.childRequestApproved)
      : translate(parentalConsents.childRequestDenied);
  };

  const answerConsent = async (answer: ConsentAnswer) => {
    const auditDataHeader = legallySensitiveActions?.getBase64EncodedAuditHeader?.();
    try {
      await answerConsentRequest({
        consentId: consent.id,
        childUserId: consent.childUserId,
        answer,
        ...(auditDataHeader ? { auditDataHeader } : {}),
      }).unwrap();
      snackbarService.success(getSuccessMessage(answer));
    } catch (error) {
      const errorCode = (error as TUpdateChildSettingsError)?.data?.code;
      if (errorCode === UpdateChildSettingsErrorCode.ParentNotVerified) {
        window.location.href = getConsentDetailsPageUrl(consent.id);
      } else {
        snackbarService.warning(translate(commonTranslationConstants.unknownError));
      }
    }
  };

  const childPages = useAppSelector(selectChildPagesForChildUserId(child.userId));
  const pageToRedirectTo = (): { url: string; isExternal: boolean; label: string } | undefined => {
    if (consent?.consentType === ParentConsentType.AddTrustedConnection) {
      return {
        url: getTrustedConnectionReviewPageUrl(consent.id, sessionId),
        isExternal: true,
        label: translate(commonTranslationConstants.review),
      };
    }
    if (consent?.consentType === ParentConsentType.UpdateUserSetting) {
      let path: string | undefined;
      switch (settingName) {
        case UserSetting.enablePurchases:
          path = childPages?.childSettingCategoryPages?.[SettingCategoryPageName.Spending]?.path;
          break;
        case UserSetting.monthlySpendLimit:
          path = childPages?.spendingPages[SpendSettingName.MonthlySpendingLimit]?.path;
          break;
        case UserSetting.monthlySpendLimitNotificationType:
          path = childPages?.spendingPages[SpendSettingName.SpendNotifications]?.path;
          break;
        case UserSetting.dailyScreenTimeLimit:
          path = childPages?.screenTimeManagementPage.path;
          break;
        default:
          break;
      }
      if (path) {
        return { url: path, isExternal: false, label: translate(parentalConsents.goToSettings) };
      }
    }
    return undefined;
  };

  if (!getText()) {
    // Error occurred, don't render anything
    return <React.Fragment />;
  }

  const getSecondaryButton = (): JSX.Element => {
    const redirect = pageToRedirectTo();
    if (redirect) {
      return (
        <Button
          variant={Button.variants.secondary}
          size={Button.sizes.medium}
          onClick={() => {
            if (redirect.isExternal) {
              window.location.href = redirect.url;
            } else {
              history.push(redirect.url);
            }
          }}
        >
          {redirect.label}
        </Button>
      );
    }

    return (
      <Button
        variant={Button.variants.secondary}
        size={Button.sizes.medium}
        onClick={async () => {
          await answerConsent(ConsentAnswer.Approve);
        }}
      >
        {translate(commonTranslationConstants.approve)}
      </Button>
    );
  };

  return (
    <div className="consent-card section-content">
      <div className="font-header-2">{getText()}</div>
      <div className="btn-container">
        <Button
          variant={Button.variants.secondary}
          size={Button.sizes.medium}
          onClick={async () => {
            await answerConsent(ConsentAnswer.Deny);
          }}
        >
          {translate(commonTranslationConstants.deny)}
        </Button>
        {getSecondaryButton()}
      </div>
    </div>
  );
};

export default ConsentCenterCard;
