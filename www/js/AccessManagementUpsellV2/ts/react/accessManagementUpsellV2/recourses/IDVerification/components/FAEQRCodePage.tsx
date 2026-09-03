import React from 'react';
import { Dialog, DialogContent, DialogBody } from '@rbx/foundation-ui';
import { TranslateFunction } from 'react-utilities';
import { HeadingConstants, LabelConstants } from '../constants/textConstants';

function FAEQRCodePage({
  qrDataUrl,
  translate,
  onHide
}: {
  qrDataUrl: string;
  translate: TranslateFunction;
  onHide: () => void;
}): React.ReactElement {
  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open) onHide();
      }}
      size='Medium'
      isModal
      hasCloseAffordance
      closeLabel={translate('Action.Close') || 'Close'}>
      <DialogContent>
        <DialogBody>
          <div className='fae-qr-code-header'>
            <h5 className='fae-qr-code-heading'>
              {translate(HeadingConstants.CheckAgeOnMobileApp) ||
                "Let's check your age on the mobile app"}
            </h5>
            <p className='fae-qr-code-subheading'>
              {translate(LabelConstants.AgeCheckBenefit) ||
                'Get an age check to enjoy more content and features.'}
            </p>
          </div>
          <div className='fae-qr-code-card'>
            <img
              src={qrDataUrl}
              alt='QR code to verify age on mobile device'
              className='fae-qr-code-image'
            />
            <div className='fae-qr-code-card-text'>
              <p className='fae-qr-code-scan-instruction'>
                {translate(LabelConstants.ScanQRCodeToAgeCheck) ||
                  'Scan this QR code with your phone or tablet camera to complete an age check'}
              </p>
              <div className='fae-qr-code-divider' />
              <p className='fae-qr-code-fallback'>
                <span className='fae-qr-code-fallback-bold'>
                  {translate(LabelConstants.NotScanning) || 'Not scanning?'}
                </span>{' '}
                {translate(LabelConstants.DownloadAppFallback) ||
                  'Download the Roblox app on your mobile device and go to Settings > Account Info'}
              </p>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default FAEQRCodePage;
