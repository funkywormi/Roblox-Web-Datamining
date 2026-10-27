import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';
import { DialogBody, DialogTitle, Icon } from '@rbx/foundation-ui';
import type { TranslateFunction } from '@rbx/core-scripts/react';
import { buttonVariants } from '../constants/buttonConstants';
import IdvButton from './IdvButton';
import events from '../constants/idVerificationEventStreamConstants';
import { sendIdVerificationEvent } from '../services/ageVerificationServices';
import { ModalEntry } from '../constants/viewConstants';

type VendorLinkPageProps = {
  translate: TranslateFunction;
  onHide: () => void;
  verificationLink: string;
  useQRCode?: boolean;
  origin: string;
  entry: string;
  redirectUrl?: string;
};

function VendorLinkPage({
  translate,
  onHide,
  verificationLink,
  useQRCode,
  origin,
  entry,
  redirectUrl = ''
}: VendorLinkPageProps) {
  const [qrImgSrc, setQRImgSrc] = useState<string>();
  const [showQRImg, setShowQRImg] = useState<boolean | string | undefined>(false);
  useEffect(() => {
    async function fetchQRCode() {
      let url;
      try {
        url = await QRCode.toDataURL(verificationLink, { errorCorrectionLevel: 'H' });
        setQRImgSrc(url);
      } catch (err) {
        throw new Error(err as string);
      } finally {
        setShowQRImg(useQRCode && url);
      }
    }
    fetchQRCode();
  }, [useQRCode, verificationLink]);

  const linkClicked = () => {
    sendIdVerificationEvent(events.verificationLinkClicked, {
      origin
    });
  };
  const mobileLinkTarget = entry === ModalEntry.parentalVerification ? '_self' : '_blank';
  const mobileLink =
    entry === ModalEntry.parentalVerification
      ? `${verificationLink}&redirect-uri=${encodeURIComponent(redirectUrl)}`
      : verificationLink;

  return (
    <React.Fragment>
      <div className='modal-header'>
        <div className='email-upsell-title-container'>
          <button type='button' className='email-upsell-title-button' onClick={onHide}>
            <Icon name='icon-regular-x' size='Large' className='idv-close-icon' />
          </button>
          <DialogTitle className='modal-title'>
            {translate('Heading.IdentityVerification')}
          </DialogTitle>
        </div>
      </div>
      <DialogBody className='modal-body verification-link-page-content'>
        <div className='verification-link-upsell'>{translate('Label.AgeVerifyPrompt')}</div>
        <div className='preparation-list-wrapper'>
          <div className='preparation-list-item'>
            <Icon name='icon-regular-page' size='Large' className='idv-prep-icon' />
            <div className='preparation-list-text'>
              <div className='preparation-title'>{translate('Label.PrepareId')}</div>
              <div className='preparation-text'>{translate('Label.ValidIdList')}</div>
            </div>
          </div>
          {showQRImg && (
            <div className='preparation-list-item'>
              <Icon name='icon-regular-smartphone-portrait' size='Large' className='idv-prep-icon' />
              <div className='preparation-list-text'>
                <div className='preparation-title'>{translate('Label.UseSmartphone')}</div>
                <div className='preparation-text'>{translate('Label.SmartphoneRequired')}</div>
              </div>
            </div>
          )}
        </div>
        {showQRImg && (
          <div>
            <div className='verification-link-upsell'>{translate('Label.ScanQRCode')}</div>
            <div className='qr-code-wrapper'>
              <img className='qr-code-img' src={qrImgSrc} alt='qr' />
            </div>
          </div>
        )}
        <p
          className='verification-link-legal'
          dangerouslySetInnerHTML={{
            __html: translate('Label.PrivacyNoticeAndLink', {
              spanStart:
                "<a class='text-link' href='https://en.help.roblox.com/hc/en-us/articles/4412863575316'>",
              spanEnd: '</a>'
            })
          }}
        />
        {!showQRImg && (
          <a href={mobileLink} onClick={linkClicked} target={mobileLinkTarget} rel='noreferrer'>
            <IdvButton className='primary-link' variant={buttonVariants.primary}>
              {translate('Action.StartSession')}
            </IdvButton>
          </a>
        )}
      </DialogBody>
    </React.Fragment>
  );
}

export default VendorLinkPage;
