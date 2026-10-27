import React, { useEffect } from 'react';
import { DialogBody, DialogFooter, DialogTitle, Icon } from '@rbx/foundation-ui';
import { assetUrl } from '@rbx/www-common/asset';
import type { TranslateFunction } from '@rbx/core-scripts/react';
import HeartsIcon from '../../../../images/idVerification/hearts_large@3x.png';
import VoiceChatIcon from '../../../../images/idVerification/voicechat_large@3x.png';
import events from '../constants/idVerificationEventStreamConstants';
import { recordUserSeenUpsellModal, sendChatEvent } from '../services/voiceChatService';
import useVoiceConsentForm from './useVoiceConsentForm';
import type { VoiceUpsellKeys } from '../stores/IdVerificationStoreContext';

type VoiceUpsellProps = VoiceUpsellKeys & {
  translate: TranslateFunction;
  communityStandardsUrl: string;
  voiceFAQUrl: string;
  requireExplicitVoiceConsent?: boolean;
  useVoiceUpsellV2Design?: boolean;
};

const ICON_SIZE = 60;

function VoiceUpsell({
  translate,
  communityStandardsUrl,
  voiceFAQUrl,
  requireExplicitVoiceConsent,
  heading,
  enableVoiceChat,
  followCommunityStandards,
  implicitConsent,
  explicitConsent,
  learnMoreAboutVoiceRecording,
  buttonStack,
  useVoiceUpsellV2Design
}: VoiceUpsellProps) {
  const [checkbox, buttons] = useVoiceConsentForm(
    translate,
    buttonStack,
    implicitConsent,
    explicitConsent,
    requireExplicitVoiceConsent
  );

  useEffect(() => {
    sendChatEvent(events.showEnableVoiceChatModal);
    recordUserSeenUpsellModal();
  }, []);

  return (
    <React.Fragment>
      <div className='modal-header'>
        <div className='email-upsell-title-container'>
          <DialogTitle className='modal-title'>{translate(heading)}</DialogTitle>
        </div>
      </div>
      <DialogBody className='modal-body'>
        <div>
          <div className='legal-enable-page-row'>
            <img width={ICON_SIZE} height={ICON_SIZE} src={assetUrl(VoiceChatIcon)} alt='' />
            <p className='legal-enable-page-row-label'>{translate(enableVoiceChat)}</p>
          </div>
          <div className='legal-enable-page-row'>
            <img width={ICON_SIZE} height={ICON_SIZE} src={assetUrl(HeartsIcon)} alt='' />
            <p
              className='legal-enable-page-row-label'
              dangerouslySetInnerHTML={{
                __html: translate(followCommunityStandards, {
                  linkStart: `<a class="text-name" target="_blank" rel="noreferrer" href=${communityStandardsUrl}>`,
                  linkEnd: '</a>'
                })
              }}
            />
          </div>
        </div>
        {checkbox}
      </DialogBody>
      <DialogFooter className='modal-footer'>{buttons}</DialogFooter>
      <div className='text-footer legal-enable-page-text-footer border-top'>
        <span>
          <Icon name='icon-regular-circle-question' size='Large' className='idv-footer-icon' />
          <a
            className='text-link legal-enable-page-text-footer-link'
            target='_blank'
            rel='noreferrer'
            href={voiceFAQUrl}
            onClick={() =>
              useVoiceUpsellV2Design && sendChatEvent(events.learnMoreAboutVoiceRecordingUpsell)
            }>
            {translate(learnMoreAboutVoiceRecording)}
          </a>
        </span>
      </div>
    </React.Fragment>
  );
}

export default VoiceUpsell;
