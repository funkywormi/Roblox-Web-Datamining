import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';
import { DialogBody, DialogTitle, Icon } from '@rbx/foundation-ui';
import type { TranslateFunction } from '@rbx/core-scripts/react';
import { buttonVariants } from '../constants/buttonConstants';
import IdvButton from './IdvButton';
import events from '../constants/idVerificationEventStreamConstants';
import { VerificationChecklistStep } from '../constants/viewConstants';
import { sendIdVerificationEvent } from '../services/ageVerificationServices';

type ChecklistPageProps = {
  translate: TranslateFunction;
  onHide: () => void;
  verificationLink: string;
  useQRCode?: boolean;
  checklistStep: number;
  origin: string;
};

function ChecklistPage({
  translate,
  onHide,
  verificationLink,
  useQRCode,
  checklistStep,
  origin
}: ChecklistPageProps) {
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

  const stepKey = [
    'Label.ConnectingToMobile',
    'Label.VerifyingYou',
    'Label.VerificationWaitingForResults',
    'Label.UpdatingRoblox'
  ];
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
      <DialogBody className='modal-body verification-checklist-page-content'>
        <div className='cta'>
          {translate(
            checklistStep === VerificationChecklistStep.Connecting ||
              checklistStep === VerificationChecklistStep.Verifying
              ? 'Label.VerifyInBrowser'
              : 'Label.VerificationDataSubmitted'
          )}
        </div>
        <ul className='checklist-wrapper'>
          {stepKey.map((key, index) =>
            index <= checklistStep ? (
              <li className='checklist-item'>
                <span className='check-wrapper'>
                  {index === checklistStep ? (
                    <span className='spinner spinner-sm' />
                  ) : (
                    <Icon name='icon-regular-check' size='Large' className='idv-check-icon' />
                  )}
                </span>
                <span className='checklist-text'>{translate(key)}</span>
              </li>
            ) : null
          )}
        </ul>

        {showQRImg && (
          <div className='verification-link-page-content'>
            <div className='qr-code-wrapper'>
              <img className='qr-code-img' src={qrImgSrc} alt='qr' />
            </div>
            <div className='footer-text'>{translate('Label.HavingTroubleScanCode')}</div>
          </div>
        )}
        {!showQRImg && (
          <a href={verificationLink} onClick={linkClicked} target='_blank' rel='noreferrer'>
            <IdvButton className='primary-link' variant={buttonVariants.primary}>
              {translate('Action.RestartSession')}
            </IdvButton>
          </a>
        )}
        <div className='footer-text'>{translate('Label.PleaseDoNotClose')}</div>
      </DialogBody>
    </React.Fragment>
  );
}

export default ChecklistPage;
