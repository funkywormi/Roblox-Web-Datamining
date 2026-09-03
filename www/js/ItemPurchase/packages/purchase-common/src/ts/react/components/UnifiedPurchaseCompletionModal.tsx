import React from 'react';
import { TranslateFunction, withTranslations } from '@rbx/core-scripts/react';
import { Dialog, DialogContent, DialogBody, DialogFooter, Button, Icon } from '@rbx/foundation-ui';
import { translateHtml } from '@rbx/translation-utils';
import type { TranslateHtmlTag } from '@rbx/translation-utils';
import itemPurchaseConstants from '../../../js/react/itemPurchase/constants/itemPurchaseConstants';
import UnifiedPurchaseHeading from './UnifiedPurchaseHeading';
import translationConfig from '../../../js/react/itemPurchase/translation.config';

const { resources } = itemPurchaseConstants;

type UnifiedPurchaseCompletionModalProps = {
  open: boolean;
  onClose: () => void;
  itemName: string;
  currentRobuxBalance?: number;
  translate: TranslateFunction;
};

const UnifiedPurchaseCompletionModal = ({
  open,
  onClose,
  itemName,
  currentRobuxBalance,
  translate
}: UnifiedPurchaseCompletionModalProps): JSX.Element => {
  const completeTitle = translate(resources.purchaseCompleteHeading);
  const buttonLabel = translate(resources.okAction);
  const renderBold = (text: React.ReactNode) => <b>{text}</b>;
  const boldTags: TranslateHtmlTag[] = [
    { opening: 'boldStart', closing: 'boldEnd', render: renderBold }
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
      size='Medium'
      isModal
      hasCloseAffordance
      closeLabel={translate('Action.Close')}>
      <DialogContent
        className='relative width-full'
        aria-describedby='unified-purchase-completion-modal-body'>
        <DialogBody className='gap-xlarge flex flex-col'>
          <div style={{ marginTop: -4 }}>
            <UnifiedPurchaseHeading
              translate={translate}
              titleText={completeTitle}
              currentRobuxBalance={currentRobuxBalance}
            />
          </div>
          <div className='flex justify-center gap-bottom-large'>
            <Icon
              name='icon-regular-circle-check'
              size='XLarge'
              style={{
                fontSize: 48,
                width: 48,
                height: 48,
                lineHeight: 1
              }}
            />
          </div>
          <div id='unified-purchase-completion-modal-body' className='text-center text-body-large'>
            {translateHtml(translate, resources.unifiedPurchaseCompletionMessage, boldTags, {
              assetName: itemName
            })}
          </div>
        </DialogBody>
        <DialogFooter className='gap-small flex flex-col mt-[40px]'>
          <div className='flex flex-row-reverse'>
            <Button variant='Emphasis' className='fill basis-0' onClick={onClose}>
              {buttonLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default withTranslations(
  UnifiedPurchaseCompletionModal,
  translationConfig.purchasingResources
);
