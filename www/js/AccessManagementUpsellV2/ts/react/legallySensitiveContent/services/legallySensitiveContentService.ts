import { TranslateFunction } from 'react-utilities';
import { UserSetting } from '../enums/UserSetting';
import {
  TLegallySensitiveData,
  TLegallySensitiveActions
} from '../types/legallySensitiveContentTypes';
import { SettingValue } from '../types/settingTypes';
import legallySensitiveContentConstants from '../constants/legallySensitiveContentConstants';
import { updateUserSetting } from './userSettingsService';
import { getAuditDataForConsent, getEncodedAuditHeader } from '../utils/auditUtils';
import ConsentName from '../enums/ConsentName';

/**
 * Hook for managing legally sensitive content and actions.
 * This hook provides a standardized way to handle legally sensitive content,
 * such as consent forms and user settings updates with audit logs.
 *
 * @param {TranslateFunction} translate - Function to translate text
 * @param {ConsentName} consentName - The name of the consent being updated
 * @param {string} surface - The surface this setting update is triggered from, i.e which modal, page, etc.
 * @param {Record<string, unknown>} translationArgs - Additional arguments needed for translation
 * @returns {[TLegallySensitiveData, TLegallySensitiveActions]} Tuple containing:
 *   - Legally sensitive data (consent text and form type)
 *   - Actions for updating settings with audit logs
 */
export const useTranslatedLegallySensitiveContentAndActions = (
  translate: TranslateFunction,
  consentName: ConsentName,
  surface: string,
  translationArgs?: Record<string, unknown>
): [TLegallySensitiveData, TLegallySensitiveActions] => {
  const getLegallySensitiveData = (): TLegallySensitiveData => {
    let languageConstants;
    switch (consentName) {
      case ConsentName.phoneNumberDiscoverabilitySetting: {
        languageConstants = legallySensitiveContentConstants.phoneNumberDiscoverabilitySetting;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      }
      case ConsentName.phoneNumberDiscoverabilitySettingParentSide: {
        languageConstants =
          legallySensitiveContentConstants.phoneNumberDiscoverabilitySettingParentSide;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      }
      case ConsentName.phoneNumberDiscoverabilityUpsell:
        languageConstants = legallySensitiveContentConstants.phoneNumberDiscoverabilityUpsell;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey),
            actionButtonText: translate(languageConstants.actionButtonTextTranslationKey),
            neutralButtonText: translate(languageConstants.neutralButtonTextTranslationKey)
          }
        };
      case ConsentName.personalizedAdsSetting:
        languageConstants = legallySensitiveContentConstants.personalizedAdsSetting;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey, {
              linkStart: languageConstants.linkStart,
              linkEnd: languageConstants.linkEnd
            })
          }
        };
      case ConsentName.sellShareDataSetting:
        languageConstants = legallySensitiveContentConstants.sellShareDataSetting;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey, {
              linkStart: languageConstants.linkStart,
              linkEnd: languageConstants.linkEnd
            })
          }
        };
      case ConsentName.allowMarketingEmailCheckboxEmailVerification:
        languageConstants =
          legallySensitiveContentConstants.allowMarketingEmailCheckboxEmailVerification;
        return {
          wordsOfConsent: {
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.voiceDataConsentSetting:
        languageConstants = legallySensitiveContentConstants.voiceDataConsentSetting;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey, {
              linkStart: languageConstants.linkStart,
              linkEnd: languageConstants.linkEnd
            })
          }
        };
      case ConsentName.voiceDataConsentSettingParentSide:
        languageConstants = legallySensitiveContentConstants.voiceDataConsentSettingParentSide;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey, {
              linkStart: languageConstants.linkStart,
              linkEnd: languageConstants.linkEnd
            })
          }
        };
      case ConsentName.whoCanPartyWithMe:
        languageConstants = legallySensitiveContentConstants.whoCanPartyWithMe;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanPartyWithMeV2:
        languageConstants = legallySensitiveContentConstants.whoCanPartyWithMeV2;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanPartyWithMeParentSide:
        languageConstants = legallySensitiveContentConstants.whoCanPartyWithMeParentSide;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanPartyWithMeParentSideV2:
        languageConstants = legallySensitiveContentConstants.whoCanPartyWithMeParentSideV2;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyChatWithMe:
        languageConstants = legallySensitiveContentConstants.whoCanUsePartyChatWithMe;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyChatWithMeV2:
        languageConstants = legallySensitiveContentConstants.whoCanUsePartyChatWithMeV2;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyChatWithMeParentSide:
        languageConstants = legallySensitiveContentConstants.whoCanUsePartyChatWithMeParentSide;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyChatWithMeParentSideV2:
        languageConstants = legallySensitiveContentConstants.whoCanUsePartyChatWithMeParentSideV2;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyVoiceWithMe:
        languageConstants = legallySensitiveContentConstants.whoCanUsePartyVoiceWithMe;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyVoiceWithMeV2:
        languageConstants = legallySensitiveContentConstants.whoCanUsePartyVoiceWithMeV2;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyVoiceWithMeParentSide:
        languageConstants = legallySensitiveContentConstants.whoCanUsePartyVoiceWithMeParentSide;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyVoiceWithMeParentSideV2:
        languageConstants = legallySensitiveContentConstants.whoCanUsePartyVoiceWithMeParentSideV2;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanPartyWithMeTrustedFriends:
        languageConstants = legallySensitiveContentConstants.whoCanPartyWithMeTrustedFriends;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanPartyWithMeTrustedFriendsV2:
        languageConstants = legallySensitiveContentConstants.whoCanPartyWithMeTrustedFriendsV2;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanPartyWithMeParentSideRemovedComms:
        languageConstants =
          legallySensitiveContentConstants.whoCanPartyWithMeParentSideRemovedComms;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanPartyWithMeParentSideRemovedCommsV2:
        languageConstants =
          legallySensitiveContentConstants.whoCanPartyWithMeParentSideRemovedCommsV2;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyChatWithMeTrustedFriends:
        languageConstants = legallySensitiveContentConstants.whoCanUsePartyChatWithMeTrustedFriends;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyChatWithMeTrustedFriendsV2:
        languageConstants =
          legallySensitiveContentConstants.whoCanUsePartyChatWithMeTrustedFriendsV2;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyChatWithMeParentSideTrustedFriends:
        languageConstants =
          legallySensitiveContentConstants.whoCanUsePartyChatWithMeParentSideTrustedFriends;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyChatWithMeParentSideTrustedFriendsV2:
        languageConstants =
          legallySensitiveContentConstants.whoCanUsePartyChatWithMeParentSideTrustedFriendsV2;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyVoiceWithMeTrustedFriends:
        languageConstants =
          legallySensitiveContentConstants.whoCanUsePartyVoiceWithMeTrustedFriends;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyVoiceWithMeTrustedFriendsV2:
        languageConstants =
          legallySensitiveContentConstants.whoCanUsePartyVoiceWithMeTrustedFriendsV2;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyVoiceWithMeParentSideTrustedFriends:
        languageConstants =
          legallySensitiveContentConstants.whoCanUsePartyVoiceWithMeParentSideTrustedFriends;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.whoCanUsePartyVoiceWithMeParentSideTrustedFriendsV2:
        languageConstants =
          legallySensitiveContentConstants.whoCanUsePartyVoiceWithMeParentSideTrustedFriendsV2;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageTitleTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.titleTranslationKey),
            consent: translate(languageConstants.consentTranslationKey)
          }
        };
      case ConsentName.receiveRobuxTransferConsentCard:
        languageConstants = legallySensitiveContentConstants.receiveRobuxTransferConsentCard;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey, {
              username: translationArgs?.username,
              amount: translationArgs?.amount
            }),
            description: translate(languageConstants.descriptionTranslationKey, {
              robuxAmount: translationArgs?.amount
            })
          }
        };
      case ConsentName.sendRobuxTransferConsentCard:
        languageConstants = legallySensitiveContentConstants.sendRobuxTransferConsentCard;
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey, {
              username: translationArgs?.username,
              amount: translationArgs?.amount
            }),
            description: translate(languageConstants.descriptionTranslationKey, {
              robuxAmount: translationArgs?.amount
            })
          }
        };
      case ConsentName.vpcRequestLinkSubjectToPC:
      case ConsentName.vpcRequestLinkNotSubjectToPC:
      case ConsentName.vpcRequestLinkDefault:
        languageConstants = legallySensitiveContentConstants.vpcRequestLinkDefault;
        if (consentName === ConsentName.vpcRequestLinkSubjectToPC) {
          languageConstants = legallySensitiveContentConstants.vpcRequestLinkSubjectToPC;
        } else if (consentName === ConsentName.vpcRequestLinkNotSubjectToPC) {
          languageConstants = legallySensitiveContentConstants.vpcRequestLinkNotSubjectToPC;
        }
        return {
          wordsOfConsent: {
            title: translate(languageConstants.titleTranslationKey),
            description: translate(languageConstants.descriptionTranslationKey, {
              lineBreak: languageConstants.lineBreak
            }),
            textboxLabel: translate(languageConstants.parentEmailLabelTranslationKey),
            placeholderText: translate(languageConstants.parentEmailPlaceholderTranslationKey),
            footer: translate(languageConstants.parentEmailFooterTranslationKey, {
              linkStart: languageConstants.linkStart,
              linkEnd: languageConstants.linkEnd
            }),
            button: translate(languageConstants.buttonTranslationKey)
          }
        };
      case ConsentName.consentCenterAllowAction:
        languageConstants = legallySensitiveContentConstants.consentCenterAllowAction;
        return {
          wordsOfConsent: {
            text: translate(languageConstants.textTranslationKey, {
              actionName: translationArgs?.actionName
            })
          }
        };
      case ConsentName.consentCenterUpdateSettingNoValue:
        languageConstants = legallySensitiveContentConstants.consentCenterUpdateSettingNoValue;
        return {
          wordsOfConsent: {
            text: translate(languageConstants.textTranslationKey, {
              settingName: translationArgs?.settingName
            })
          }
        };
      case ConsentName.consentCenterUpdateSettingWithValue:
        languageConstants = legallySensitiveContentConstants.consentCenterUpdateSettingWithValue;
        return {
          wordsOfConsent: {
            text: translate(languageConstants.textTranslationKey, {
              settingName: translationArgs?.settingName,
              currentValue: translationArgs?.currentValue,
              proposedValue: translationArgs?.proposedValue
            })
          }
        };
      case ConsentName.allowMarketingEmailNotifications:
        languageConstants = legallySensitiveContentConstants.allowMarketingEmailNotifications;
        return {
          wordsOfConsent: {
            pageTitle: translate(languageConstants.pageHeadingTranslationKey),
            pageDescription: translate(languageConstants.pageDescriptionTranslationKey),
            title: translate(languageConstants.labelTranslationKey),
            consent: translate(languageConstants.labelDescriptionTranslationKey)
          }
        };
      default:
        return undefined;
    }
  };

  const updateSettingWithAuditing = async (
    settingName: UserSetting,
    settingValue: SettingValue,
    additionalContextualData?: Record<string, unknown>
  ) => {
    const auditData = getAuditDataForConsent(consentName, translate, translationArgs);
    const auditHeaderValue = getEncodedAuditHeader(auditData, surface, additionalContextualData);
    try {
      await updateUserSetting(settingName, settingValue, auditHeaderValue);
    } catch (error) {
      // TODO: Add error handling
    }
  };

  const getBase64EncodedAuditHeader = (
    additionalContextualData?: Record<string, unknown>
  ): string => {
    const auditData = getAuditDataForConsent(consentName, translate, translationArgs);
    const encodedHeaderValue = getEncodedAuditHeader(auditData, surface, additionalContextualData);
    return encodedHeaderValue;
  };

  const legallySensitiveData = getLegallySensitiveData();
  const legallySensitiveActions: TLegallySensitiveActions = {
    updateSettingWithAuditing,
    getBase64EncodedAuditHeader
  };

  return [legallySensitiveData, legallySensitiveActions];
};

export default useTranslatedLegallySensitiveContentAndActions;
