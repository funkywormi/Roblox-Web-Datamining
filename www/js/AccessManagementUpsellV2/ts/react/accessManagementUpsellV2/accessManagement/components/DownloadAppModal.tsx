import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogBody } from '@rbx/foundation-ui';
import { TranslateFunction } from 'react-utilities';
import { EnvironmentUrls, Intl } from 'Roblox';
import { ModalEvent } from '../constants/viewConstants';
import appleBadgeEn from '../../../../../images/store-badges/apple-badge-en_us.svg';
import appleBadgeJa from '../../../../../images/store-badges/apple-badge-ja_jp.svg';
import googleBadgeEn from '../../../../../images/store-badges/google-badge-en_us.svg';
import googleBadgeJa from '../../../../../images/store-badges/google-badge-ja_jp.svg';

type TStoreBadges = {
  apple: string;
  google: string;
};

const getStoreBadges = (): TStoreBadges => {
  const locale = Intl ? new Intl().getRobloxLocale() : 'en_us';
  if (locale === 'ja_jp') {
    return { apple: appleBadgeJa, google: googleBadgeJa };
  }
  return { apple: appleBadgeEn, google: googleBadgeEn };
};

function DownloadAppModal({ translate }: { translate: TranslateFunction }): React.ReactElement {
  const [show, setShow] = useState(false);
  const badges = getStoreBadges();

  useEffect(() => {
    const handleEvent = () => {
      setShow(true);
    };

    window.addEventListener(ModalEvent.ShowDownloadAppModal, handleEvent);
    return () => window.removeEventListener(ModalEvent.ShowDownloadAppModal, handleEvent);
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setShow(false);
    }
  };

  return (
    <Dialog
      open={show}
      onOpenChange={handleOpenChange}
      size='Medium'
      isModal
      hasCloseAffordance
      closeLabel={translate('Action.Dialog.Close')}>
      <DialogContent>
        <DialogBody className='text-body-medium'>
          <DialogTitle className='text-heading-small'>
            {translate('Heading.CheckAgeOnMobileApp')}
          </DialogTitle>
          <div className='flex flex-col gap-medium'>
            <p className='text-body-medium content-default margin-none'>
              {translate('Label.AgeCheckBenefit')}
            </p>
            <div className='bg-shift-100 radius-large padding-large flex flex-col gap-medium'>
              <div className='flex flex-col gap-xsmall'>
                <h3 className='text-title-medium content-emphasis margin-none'>
                  {translate('Heading.GetTheApp')}
                </h3>
                <p className='text-body-medium content-muted margin-none'>
                  {translate('Label.GetAppOnStore')}
                </p>
              </div>
              <div className='flex wrap gap-small'>
                <a
                  className='shrink-0'
                  href={EnvironmentUrls.appStoreLink}
                  target='_blank'
                  rel='noreferrer noopener'>
                  <img
                    src={badges.apple}
                    alt={translate('Label.DownloadOnTheAppStore')}
                    className='height-1200 width-auto block'
                  />
                </a>
                <a
                  className='shrink-0'
                  href={EnvironmentUrls.googlePlayStoreLink}
                  target='_blank'
                  rel='noreferrer noopener'>
                  <img
                    src={badges.google}
                    alt={translate('Label.GetItOnGooglePlay')}
                    className='height-1200 width-auto block'
                  />
                </a>
              </div>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default DownloadAppModal;
