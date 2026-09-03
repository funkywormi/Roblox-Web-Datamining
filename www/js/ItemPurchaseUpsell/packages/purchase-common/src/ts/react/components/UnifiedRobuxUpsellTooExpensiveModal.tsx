import React from 'react';
import { TranslateFunction } from '@rbx/core-scripts/react';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, Icon } from '@rbx/foundation-ui';
import UnifiedPurchaseHeading from './UnifiedPurchaseHeading';
import UnifiedProductDetails from './UnifiedProductDetails';
import { LANG_KEYS } from '../../../js/core/services/itemPurchaseUpsellService/constants/upsellConstants';
import useModalShownTracking from '../hooks/useModalShownTracking';

export type UnifiedRobuxUpsellTooExpensiveModalProps = {
  translate: TranslateFunction;
  expectedPrice: number;
  thumbnail: React.ReactNode;
  assetName: string;
  onAction: () => void;
  onCancel?: () => void;
  loading?: boolean;
  currentRobuxBalance?: number;
  open?: boolean;
};
const UnifiedRobuxUpsellTooExpensiveModal: React.FC<UnifiedRobuxUpsellTooExpensiveModalProps> = ({
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

export default UnifiedRobuxUpsellTooExpensiveModal;
