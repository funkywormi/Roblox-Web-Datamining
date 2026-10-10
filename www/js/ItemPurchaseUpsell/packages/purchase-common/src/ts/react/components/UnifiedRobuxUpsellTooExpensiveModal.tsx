import React from 'react';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, Icon } from '@rbx/foundation-ui';
import UnifiedPurchaseHeading from './UnifiedPurchaseHeading';
import UnifiedProductDetails from './UnifiedProductDetails';
import { LANG_KEYS } from '../../core/services/itemPurchaseUpsellService/constants/upsellConstants';
import useModalShownTracking from '../hooks/useModalShownTracking';
import { SelfProvidedTranslate } from '../itemPurchase/SelfProvidedTranslate';
import {
  purchasingNamespaces,
  usePurchasingTranslate,
  type PurchaseTranslate
} from '../itemPurchase/useTranslate';

export type UnifiedRobuxUpsellTooExpensiveModalProps = {
  translate?: PurchaseTranslate;
  expectedPrice: number;
  thumbnail: React.ReactNode;
  assetName: string;
  onAction: () => void;
  onCancel?: () => void;
  loading?: boolean;
  currentRobuxBalance?: number;
  open?: boolean;
};
const UnifiedRobuxUpsellTooExpensiveModalInner: React.FC<
  UnifiedRobuxUpsellTooExpensiveModalProps & { translate: PurchaseTranslate }
> = ({
  translate,
  expectedPrice,
  thumbnail,
  assetName,
  onAction,
  onCancel,
  loading = false,
  currentRobuxBalance,
  open = false
}) => {
  useModalShownTracking('UnifiedRobuxUpsellTooExpensiveModal', open);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        if (!nextOpen && onCancel) {
          onCancel();
        }
      }}
      isModal
      size='Large'
      type='Default'
      closeLabel={translate('Action.Close') || 'Close'}
      hasCloseAffordance>
      <DialogContent className='relative width-full'>
        <DialogBody className='gap-large flex flex-col'>
          <div className='margin-bottom-xsmall'>
            <UnifiedPurchaseHeading
              translate={translate}
              titleText={translate(LANG_KEYS.insufficientRobuxHeadingNew)}
              currentRobuxBalance={currentRobuxBalance}
            />
          </div>
          <UnifiedProductDetails
            translate={translate}
            thumbnail={thumbnail}
            assetName={assetName}
            expectedPrice={expectedPrice}
          />
        </DialogBody>

        <DialogFooter className='gap-small flex flex-col mt-[40px]'>
          <div className='flex flex-row-reverse'>
            <Button
              aria-label={translate(LANG_KEYS.insufficientRobuxHeadingNew)}
              variant='Emphasis'
              className=' fill'
              onClick={onAction}
              isDisabled={loading}
              data-testid='purchase-confirm-button'>
              <div className='fill basis-0 inline-flex items-center gap-medium leading-none'>
                <Icon name='icon-filled-arrow-up-right-from-square' className='align-middle' />
                {translate(LANG_KEYS.buyRobux)}
              </div>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Dual-path translation boundary (detached-root render — self-wraps on .NET). See UnifiedRobuxUpsellModal.
const UnifiedRobuxUpsellTooExpensiveModal: React.FC<UnifiedRobuxUpsellTooExpensiveModalProps> = ({
  translate,
  ...props
}) => (
  <SelfProvidedTranslate
    translate={translate}
    namespaces={purchasingNamespaces}
    useTranslate={usePurchasingTranslate}
    render={t => <UnifiedRobuxUpsellTooExpensiveModalInner {...props} translate={t} />}
  />
);

export default UnifiedRobuxUpsellTooExpensiveModal;
