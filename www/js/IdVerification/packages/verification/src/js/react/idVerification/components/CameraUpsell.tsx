import React, { useEffect } from 'react';
import { DialogBody, DialogFooter, DialogTitle, Icon } from '@rbx/foundation-ui';
import { assetUrl } from '@rbx/www-common/asset';
import type { TranslateFunction } from '@rbx/core-scripts/react';
import LockIcon from '../../../../images/idVerification/lock_xxlarge@3x.png';
import CameraIcon from '../../../../images/idVerification/avatarchat_large@3x.png';
import HeartsIcon from '../../../../images/idVerification/hearts_large@3x.png';
import useCameraConsentForm from './useCameraConsentForm';
import { sendChatEvent, recordUserSeenAvatarVideoUpsellModal } from '../services/voiceChatService';
import events from '../constants/idVerificationEventStreamConstants';
import type { CameraUpsellPageState } from '../stores/IdVerificationStoreContext';

type CameraUpsellProps = CameraUpsellPageState & {
  translate: TranslateFunction;
};

const ICON_SIZE = 60;

function CameraUpsell({
  translate,
  title,
  animateYourAvatar,
  communityStandards,
  implicitConsent,
  explicitConsent,
  requireExplicitCameraConsent,
  learnMore,
  facialPrivacyUrl,
  buttons,
  cameraPrivacy,
  useCameraU13Design
}: CameraUpsellProps) {
  const [checkbox, buttonMarkup] = useCameraConsentForm(
    translate,
    implicitConsent,
    explicitConsent,
    requireExplicitCameraConsent,
    buttons
  );

  useEffect(() => {
    sendChatEvent(events.showUnifiedChatUpsellModal);
    recordUserSeenAvatarVideoUpsellModal();
  }, []);

  return (
    <React.Fragment>
      <div className='modal-header'>
        <div className='email-upsell-title-container'>
          <DialogTitle className='modal-title'>{translate(title)}</DialogTitle>
        </div>
      </div>
      <DialogBody className='modal-body'>
        <div>
          <div className='legal-enable-page-row'>
            <img width={ICON_SIZE} height={ICON_SIZE} src={assetUrl(CameraIcon)} alt='' />
            <p className='legal-enable-page-row-label'>{translate(animateYourAvatar)}</p>
          </div>
          <div className='legal-enable-page-row'>
            <img
              width={ICON_SIZE}
              height={ICON_SIZE}
              src={assetUrl(useCameraU13Design ? LockIcon : HeartsIcon)}
              alt=''
            />
            <p className='legal-enable-page-row-label'>
              {translate(useCameraU13Design ? cameraPrivacy : communityStandards)}
            </p>
          </div>
        </div>
        {checkbox}
      </DialogBody>
      <DialogFooter className='modal-footer'>
        <div className='half-flex-container'>{buttonMarkup}</div>
      </DialogFooter>
      <div className='text-footer legal-enable-page-text-footer border-top'>
        <span>
          <Icon name='icon-regular-circle-question' size='Large' className='idv-footer-icon' />
          <a
            className='text-link legal-enable-page-text-footer-link'
            target='_blank'
            rel='noreferrer'
            href={facialPrivacyUrl}
            onClick={() => sendChatEvent(events.learnMoreAvatarVideo)}>
            {translate(learnMore)}
          </a>
        </span>
      </div>
    </React.Fragment>
  );
}

export default CameraUpsell;
