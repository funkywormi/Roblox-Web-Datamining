import { cryptoUtil } from 'core-roblox-utilities';
import { TranslateFunction } from 'react-utilities';
import { TAuditData, TAuditHeaderPayload } from '../types/legallySensitiveContentTypes';
import legallySensitiveContentConstants from '../constants/legallySensitiveContentConstants';
import ConsentName from '../enums/ConsentName';

/**
 * Creates audit data for consent forms.
 * This function generates audit data based on the consent name and translation function.
 *
 * @param {TConsentName} consentName - The consent name to generate audit data for
 * @param {TranslateFunction} translate - Function to translate text
 * @param {Record<string, unknown>} translationArgs - Arguments needed for translation
 * @returns {TAuditData[]} Array of audit data objects
 */
export const getAuditDataForConsent = (
  consentName: ConsentName,
  translate: TranslateFunction,
  translationArgs?: Record<string, unknown>
): TAuditData[] => {
  let content;
  switch (consentName) {
    case ConsentName.phoneNumberDiscoverabilitySetting:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySetting.titleTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySetting.titleSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySetting.consentTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySetting
              .consentSourceContentId
        }
      ];
    case ConsentName.phoneNumberDiscoverabilitySettingParentSide:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySettingParentSide
              .titleTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySettingParentSide
              .titleSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySettingParentSide
              .consentTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilitySettingParentSide
              .consentSourceContentId
        }
      ];
    case ConsentName.phoneNumberDiscoverabilityUpsell:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell.titleTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell.titleSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell.consentTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell.consentSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell
              .actionButtonTextTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell
              .actionButtonTextSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell
              .neutralButtonTextTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell
              .neutralButtonTextSourceContentId
        }
      ];
    case ConsentName.personalizedAdsSetting:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.personalizedAdsSetting.titleTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.personalizedAdsSetting.titleSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.personalizedAdsSetting.consentTranslationKey,
            {
              linkStart: legallySensitiveContentConstants.personalizedAdsSetting.linkStartParam,
              linkEnd: legallySensitiveContentConstants.personalizedAdsSetting.linkEndParam
            }
          ),
          sourceContentId:
            legallySensitiveContentConstants.personalizedAdsSetting.consentSourceContentId,
          vars: {
            linkStart: legallySensitiveContentConstants.personalizedAdsSetting.linkStart,
            linkEnd: legallySensitiveContentConstants.personalizedAdsSetting.linkEnd
          }
        }
      ];
    case ConsentName.sellShareDataSetting:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.sellShareDataSetting.titleTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.sellShareDataSetting.titleSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.sellShareDataSetting.consentTranslationKey,
            {
              linkStart: legallySensitiveContentConstants.sellShareDataSetting.linkStartParam,
              linkEnd: legallySensitiveContentConstants.sellShareDataSetting.linkEndParam
            }
          ),
          sourceContentId:
            legallySensitiveContentConstants.sellShareDataSetting.consentSourceContentId,
          vars: {
            linkStart: legallySensitiveContentConstants.sellShareDataSetting.linkStart,
            linkEnd: legallySensitiveContentConstants.sellShareDataSetting.linkEnd
          }
        }
      ];
    case ConsentName.allowMarketingEmailCheckboxEmailVerification:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.allowMarketingEmailCheckboxEmailVerification
              .consentTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.allowMarketingEmailCheckboxEmailVerification
              .consentSourceContentId
        }
      ];
    case ConsentName.voiceDataConsentSetting:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.voiceDataConsentSetting.titleTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.voiceDataConsentSetting.titleSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.voiceDataConsentSetting.consentTranslationKey,
            {
              linkStart: legallySensitiveContentConstants.voiceDataConsentSetting.linkStartParam,
              linkEnd: legallySensitiveContentConstants.voiceDataConsentSetting.linkEndParam
            }
          ),
          sourceContentId:
            legallySensitiveContentConstants.voiceDataConsentSetting.consentSourceContentId,
          vars: {
            linkStart: legallySensitiveContentConstants.voiceDataConsentSetting.linkStart,
            linkEnd: legallySensitiveContentConstants.voiceDataConsentSetting.linkEnd
          }
        }
      ];
    case ConsentName.voiceDataConsentSettingParentSide:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.voiceDataConsentSettingParentSide.titleTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.voiceDataConsentSettingParentSide.titleSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.voiceDataConsentSettingParentSide
              .consentTranslationKey,
            {
              linkStart:
                legallySensitiveContentConstants.voiceDataConsentSettingParentSide.linkStartParam,
              linkEnd:
                legallySensitiveContentConstants.voiceDataConsentSettingParentSide.linkEndParam
            }
          ),
          sourceContentId:
            legallySensitiveContentConstants.voiceDataConsentSettingParentSide
              .consentSourceContentId,
          vars: {
            linkStart: legallySensitiveContentConstants.voiceDataConsentSettingParentSide.linkStart,
            linkEnd: legallySensitiveContentConstants.voiceDataConsentSettingParentSide.linkEnd
          }
        }
      ];
    case ConsentName.whoCanPartyWithMe:
    case ConsentName.whoCanPartyWithMeV2:
    case ConsentName.whoCanPartyWithMeParentSide:
    case ConsentName.whoCanPartyWithMeParentSideV2:
    case ConsentName.whoCanPartyWithMeTrustedFriends:
    case ConsentName.whoCanPartyWithMeTrustedFriendsV2:
    case ConsentName.whoCanPartyWithMeParentSideRemovedComms:
    case ConsentName.whoCanPartyWithMeParentSideRemovedCommsV2:
    case ConsentName.whoCanUsePartyChatWithMe:
    case ConsentName.whoCanUsePartyChatWithMeV2:
    case ConsentName.whoCanUsePartyChatWithMeParentSide:
    case ConsentName.whoCanUsePartyChatWithMeParentSideV2:
    case ConsentName.whoCanUsePartyChatWithMeTrustedFriends:
    case ConsentName.whoCanUsePartyChatWithMeTrustedFriendsV2:
    case ConsentName.whoCanUsePartyChatWithMeParentSideTrustedFriends:
    case ConsentName.whoCanUsePartyChatWithMeParentSideTrustedFriendsV2:
    case ConsentName.whoCanUsePartyVoiceWithMe:
    case ConsentName.whoCanUsePartyVoiceWithMeV2:
    case ConsentName.whoCanUsePartyVoiceWithMeParentSide:
    case ConsentName.whoCanUsePartyVoiceWithMeParentSideV2:
    case ConsentName.whoCanUsePartyVoiceWithMeTrustedFriends:
    case ConsentName.whoCanUsePartyVoiceWithMeTrustedFriendsV2:
    case ConsentName.whoCanUsePartyVoiceWithMeParentSideTrustedFriends:
    case ConsentName.whoCanUsePartyVoiceWithMeParentSideTrustedFriendsV2: {
      const constants = legallySensitiveContentConstants[consentName];
      return [
        {
          consentStringTemplate: translate(constants.pageTitleTranslationKey),
          sourceContentId: constants.pageTitleSourceContentId
        },
        {
          consentStringTemplate: translate(constants.pageDescriptionTranslationKey),
          sourceContentId: constants.pageDescriptionSourceContentId
        },
        {
          consentStringTemplate: translate(constants.titleTranslationKey),
          sourceContentId: constants.titleSourceContentId
        },
        {
          consentStringTemplate: translate(constants.consentTranslationKey),
          sourceContentId: constants.consentSourceContentId
        }
      ];
    }
    case ConsentName.receiveRobuxTransferConsentCard:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.receiveRobuxTransferConsentCard.titleTranslationKey,
            {
              username:
                legallySensitiveContentConstants.receiveRobuxTransferConsentCard.usernameParam,
              amount: legallySensitiveContentConstants.receiveRobuxTransferConsentCard.amountParam
            }
          ),
          sourceContentId:
            legallySensitiveContentConstants.receiveRobuxTransferConsentCard.titleSourceContentId,
          vars: {
            username: translationArgs?.username as string,
            amount: translationArgs?.amount as string
          }
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.receiveRobuxTransferConsentCard
              .descriptionTranslationKey,
            {
              robuxAmount:
                legallySensitiveContentConstants.receiveRobuxTransferConsentCard.robuxAmountParam
            }
          ),
          sourceContentId:
            legallySensitiveContentConstants.receiveRobuxTransferConsentCard
              .descriptionSourceContentId,
          vars: {
            robuxAmount: translationArgs?.amount as string
          }
        }
      ];
    case ConsentName.sendRobuxTransferConsentCard:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.sendRobuxTransferConsentCard.titleTranslationKey,
            {
              username: legallySensitiveContentConstants.sendRobuxTransferConsentCard.usernameParam,
              amount: legallySensitiveContentConstants.sendRobuxTransferConsentCard.amountParam
            }
          ),
          sourceContentId:
            legallySensitiveContentConstants.sendRobuxTransferConsentCard.titleSourceContentId,
          vars: {
            username: translationArgs?.username as string,
            amount: translationArgs?.amount as string
          }
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.sendRobuxTransferConsentCard.descriptionTranslationKey,
            {
              robuxAmount:
                legallySensitiveContentConstants.sendRobuxTransferConsentCard.robuxAmountParam
            }
          ),
          sourceContentId:
            legallySensitiveContentConstants.sendRobuxTransferConsentCard
              .descriptionSourceContentId,
          vars: {
            robuxAmount: translationArgs?.amount as string
          }
        }
      ];
    case ConsentName.vpcRequestLinkSubjectToPC:
    case ConsentName.vpcRequestLinkNotSubjectToPC:
    case ConsentName.vpcRequestLinkDefault:
      content = legallySensitiveContentConstants.vpcRequestLinkDefault;
      if (consentName === ConsentName.vpcRequestLinkSubjectToPC) {
        content = legallySensitiveContentConstants.vpcRequestLinkSubjectToPC;
      } else if (consentName === ConsentName.vpcRequestLinkNotSubjectToPC) {
        content = legallySensitiveContentConstants.vpcRequestLinkNotSubjectToPC;
      }
      return [
        {
          consentStringTemplate: translate(content.titleTranslationKey),
          sourceContentId: content.titleSourceContentId
        },
        {
          consentStringTemplate: translate(content.descriptionTranslationKey, {
            lineBreak: content.lineBreakParam
          }),
          sourceContentId: content.descriptionSourceContentId,
          vars: {
            lineBreak: content.lineBreak
          }
        },
        {
          consentStringTemplate: translate(content.parentEmailLabelTranslationKey),
          sourceContentId: content.parentEmailLabelSourceContentId
        },
        {
          consentStringTemplate: translate(content.parentEmailPlaceholderTranslationKey),
          sourceContentId: content.parentEmailPlaceholderSourceContentId
        },
        {
          consentStringTemplate: translate(content.parentEmailFooterTranslationKey, {
            linkStart: content.linkStartParam,
            linkEnd: content.linkEndParam
          }),
          sourceContentId: content.parentEmailFooterSourceContentId,
          vars: {
            linkStart: content.linkStart,
            linkEnd: content.linkEnd
          }
        },
        {
          consentStringTemplate: translate(content.buttonTranslationKey),
          sourceContentId: content.buttonSourceContentId
        }
      ];
    case ConsentName.consentCenterAllowAction:
      content = legallySensitiveContentConstants.consentCenterAllowAction;
      return [
        {
          consentStringTemplate: translate(content.textTranslationKey, {
            actionName: content.actionNameParam
          }),
          sourceContentId: content.textSourceContentId,
          vars: {
            actionName: translationArgs?.actionName as string
          }
        }
      ];
    case ConsentName.consentCenterUpdateSettingNoValue:
      content = legallySensitiveContentConstants.consentCenterUpdateSettingNoValue;
      return [
        {
          consentStringTemplate: translate(content.textTranslationKey, {
            settingName: content.settingNameParam
          }),
          sourceContentId: content.textSourceContentId,
          vars: {
            settingName: translationArgs?.settingName as string
          }
        }
      ];
    case ConsentName.consentCenterUpdateSettingWithValue:
      content = legallySensitiveContentConstants.consentCenterUpdateSettingWithValue;
      return [
        {
          consentStringTemplate: translate(content.textTranslationKey, {
            settingName: content.settingNameParam,
            currentValue: content.currentValueParam,
            proposedValue: content.proposedValueParam
          }),
          sourceContentId: content.textSourceContentId,
          vars: {
            settingName: translationArgs?.settingName as string,
            currentValue: translationArgs?.currentValue as string,
            proposedValue: translationArgs?.proposedValue as string
          }
        }
      ];
    case ConsentName.allowMarketingEmailNotifications:
      return [
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.allowMarketingEmailNotifications
              .pageHeadingTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.allowMarketingEmailNotifications
              .pageHeadingSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.allowMarketingEmailNotifications
              .pageDescriptionTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.allowMarketingEmailNotifications
              .pageDescriptionSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.allowMarketingEmailNotifications.labelTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.allowMarketingEmailNotifications.labelSourceContentId
        },
        {
          consentStringTemplate: translate(
            legallySensitiveContentConstants.allowMarketingEmailNotifications
              .labelDescriptionTranslationKey
          ),
          sourceContentId:
            legallySensitiveContentConstants.allowMarketingEmailNotifications
              .labelDescriptionSourceContentId
        }
      ];
    default:
      return [];
  }
};

/**
 * Creates an audit header payload from an array of audit data.
 * Each item in the array is hashed and combined with its vars into a single object.
 *
 * @param {TAuditData[]} auditData - Array of audit data to be included in the header
 * @param {string} surface - The surface of the audit data
 * @returns {TAuditHeaderPayload} audit header payload
 */
export const getAuditHeaderPayload = (
  auditData: TAuditData[],
  surface: string,
  additionalContextualData?: Record<string, unknown>
): TAuditHeaderPayload => {
  const auditHeaderPayload = {
    content: auditData.reduce(
      (acc, data) => ({
        ...acc,
        [data.sourceContentId]: {
          hash: cryptoUtil.hashStringWithFnv1a32(data.consentStringTemplate),
          ...data.vars
        }
      }),
      {}
    ),
    surface,
    ...additionalContextualData
  };

  return auditHeaderPayload;
};

/**
 * Encodes the audit header payload to a base64 url-safe encoded string.
 *
 * @param {TAuditData[]} auditData - Array of audit data to be included in the header
 * @param {string} surface - The surface of the audit data
 * @returns {string} base64 url-safe encoded audit header value
 */
export const getEncodedAuditHeader = (
  auditData: TAuditData[],
  surface: string,
  additionalContextualData?: Record<string, unknown>
): string => {
  const auditHeaderPayload = getAuditHeaderPayload(auditData, surface, additionalContextualData);
  const json = JSON.stringify(auditHeaderPayload);
  const encodedHeaderValue = cryptoUtil.stringToUrlSafeBase64(json);

  return encodedHeaderValue;
};
