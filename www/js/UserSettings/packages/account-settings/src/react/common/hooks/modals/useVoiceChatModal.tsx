import React, { useEffect, useState } from "react";
import { IModalService } from "react-style-guide";
import { useTranslation } from "react-utilities";
import useSettingsModal from "./useSettingsModal";
import privacyTranslationConstants from "../../../userSettings/constants/contentConstants/privacyTranslationConstants";
import {
  communityStandardsLink,
  spatialVoiceLink,
  voiceFAQUrl,
} from "../../../userSettings/constants/urlConstants";
import voiceChatIcon from "../../../../images/voicechat_large@3x.png";
import heartsIcon from "../../../../images/hearts_large@3x.png";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";

const useVoiceChatModal = (
  onAction: () => Promise<void>,
  requireExplicitVoiceConsent: boolean,
): [JSX.Element, IModalService] => {
  const { translate } = useTranslation();

  const [explicitConsentChecked, setExplicitConsentChecked] = useState(false);
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const copy = uiPolicy?.displayNewVoiceConsentModalCopy
    ? {
        voiceChatHeading: privacyTranslationConstants.voiceChatHeadingV2,
        chatWithVoiceDescription: privacyTranslationConstants.chatWithVoiceDescriptionV2,
        communityStandardsDescription: privacyTranslationConstants.communityStandardsDescriptionV2,
        explicitConsentText: privacyTranslationConstants.explicitConsentText,
        implicitConsentText: privacyTranslationConstants.implicitConsentTextV2,
        learnMoreAboutVoiceRecordingLabel:
          privacyTranslationConstants.learnMoreAboutVoiceRecordingLabelV2,
        enableButton: privacyTranslationConstants.enableButton,
      }
    : {
        voiceChatHeading: privacyTranslationConstants.voiceChatHeading,
        chatWithVoiceDescription: privacyTranslationConstants.chatWithVoiceDescription,
        communityStandardsDescription: privacyTranslationConstants.communityStandardsDescription,
        explicitConsentText: privacyTranslationConstants.explicitConsentText,
        implicitConsentText: privacyTranslationConstants.implicitConsentText,
        learnMoreAboutVoiceRecordingLabel:
          privacyTranslationConstants.learnMoreAboutVoiceRecordingLabel,
        enableButton: privacyTranslationConstants.enableButton,
      };

  useEffect(() => {
    // Consent is assumed if explicit voice consent is not required
    setExplicitConsentChecked(!requireExplicitVoiceConsent);
  }, [requireExplicitVoiceConsent]);

  const voiceModalBody = (
    <React.Fragment>
      <div className="new-modal-free-communication-infographic-row">
        <img className="row-icon voice-modal-icon" src={voiceChatIcon} alt="" />
        <p
          dangerouslySetInnerHTML={{
            __html: translate(copy.chatWithVoiceDescription, {
              startLink: `<a class="text-link" target="_blank" rel="noreferrer" href="${spatialVoiceLink}">`,
              endLink: `</a>`,
            }),
          }}
        />
      </div>
      <div className="new-modal-free-communication-infographic-row">
        <img className="row-icon voice-modal-icon" src={heartsIcon} alt="" />
        <p
          dangerouslySetInnerHTML={{
            __html: translate(copy.communityStandardsDescription, {
              linkStart: `<a class="text-link" target="_blank" rel="noreferrer" href="${communityStandardsLink}">`,
              linkEnd: `</a>`,
            }),
          }}
        />
      </div>
      <br />
      {requireExplicitVoiceConsent ? (
        <div className="checkbox checkbox-container">
          <input
            type="checkbox"
            id="voice-consent"
            checked={explicitConsentChecked}
            onChange={() => setExplicitConsentChecked(!explicitConsentChecked)}
          />
          <label id="voice-consent-label" htmlFor="voice-consent">
            {translate(copy.explicitConsentText)}
          </label>
        </div>
      ) : (
        <p>{translate(copy.implicitConsentText)}</p>
      )}
    </React.Fragment>
  );

  const [voiceChatModal, voiceChatModalService] = useSettingsModal({
    titleResourceId: copy.voiceChatHeading,
    translatedBody: voiceModalBody,
    actionButtonTextResourceId: copy.enableButton,
    onAction: async () => {
      setExplicitConsentChecked(!requireExplicitVoiceConsent);
      await onAction();
    },
    onHide: () => {
      setExplicitConsentChecked(!requireExplicitVoiceConsent);
    },
    disableActionButton: !explicitConsentChecked,
    footerTextResourceId: copy.learnMoreAboutVoiceRecordingLabel,
    footerHyperlink: voiceFAQUrl,
    size: "sm",
  });

  return [voiceChatModal, voiceChatModalService];
};

export default useVoiceChatModal;
