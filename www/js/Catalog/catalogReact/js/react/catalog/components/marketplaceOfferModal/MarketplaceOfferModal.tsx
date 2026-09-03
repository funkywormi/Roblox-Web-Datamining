import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter } from '@rbx/foundation-ui';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import translationConfig from '../../translation.config';
import EmbeddableText from '../EmbeddableText';
import type { MarketplaceOffer } from '../../services/marketplaceSalesOffersService';
import prepareMarketplaceOfferBodyHtml from '../../utils/marketplaceOfferBodyHtml';
import OfferHeroIcon from './OfferHeroIcon';

type MarketplaceOfferModalProps = {
  offer: MarketplaceOffer | null;
  showModal: boolean;
  onClose: () => void;
  onConfirmDismiss: () => void;
};

const MarketplaceOfferModal = ({
  offer,
  showModal,
  onClose,
  onConfirmDismiss,
  translate
}: MarketplaceOfferModalProps & WithTranslationsProps): JSX.Element | null => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const hasOpenedMainDialogRef = useRef(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const bodyHtml = offer?.modal?.offerBodyLinkText?.trim();
  const preparedBodyHtml = useMemo(
    () => (bodyHtml ? prepareMarketplaceOfferBodyHtml(bodyHtml) : undefined),
    [bodyHtml]
  );

  const handleConfirmDismiss = useCallback(() => {
    setShowTermsModal(false);
    onConfirmDismiss();
  }, [onConfirmDismiss]);

  const handleClose = useCallback(() => {
    setShowTermsModal(false);
    onClose();
  }, [onClose]);

  if (!offer?.modal?.modalTitle?.trim()) {
    return null;
  }

  const { modal } = offer;
  const modalTitle = modal.modalTitle!.trim();
  const fallbackBodyText = offer.localizedText?.trim();
  const hasTerms = !!modal.termsBody?.trim() && !!modal.termsModalTitle?.trim();
  const termsModalTitle = modal.termsModalTitle?.trim() ?? '';
  const isMainDialogOpen = showModal && !showTermsModal;

  if (!bodyHtml && !fallbackBodyText) {
    return null;
  }

  return (
    <React.Fragment>
      <Dialog
        open={isMainDialogOpen}
        onOpenChange={(open: boolean) => {
          if (open) {
            hasOpenedMainDialogRef.current = true;
            return;
          }

          if (hasOpenedMainDialogRef.current) {
            handleClose();
          }
        }}
        isModal
        size='Medium'
        type='Default'
        ariaLabel={modalTitle}
        hasCloseAffordance={false}>
        <DialogContent
          className='marketplace-offer-modal-dialog-content'
          onOpenAutoFocus={(event: Event) => {
            // The dialog's focus trap auto-focuses the first focusable element, which is the
            // inline "View terms" link. Move initial focus to the primary action instead so
            // assistive tech doesn't land on the secondary link.
            event.preventDefault();
            confirmButtonRef.current?.focus();
          }}>
          <DialogBody className='marketplace-offer-modal-body flex flex-col gap-large'>
            <OfferHeroIcon modalHeroIcon={modal.modalHeroIcon} />
            <h2 className='marketplace-offer-modal-title'>{modalTitle}</h2>
            <p className='marketplace-offer-modal-description'>
              {preparedBodyHtml ? (
                <span
                  className='marketplace-offer-modal-description-html'
                  dangerouslySetInnerHTML={{ __html: preparedBodyHtml }}
                />
              ) : (
                <EmbeddableText text={fallbackBodyText!} />
              )}
              {hasTerms && (
                <React.Fragment>
                  {' '}
                  <button
                    type='button'
                    className='marketplace-offer-modal-terms-link text-link'
                    onClick={() => setShowTermsModal(true)}>
                    {translate('Action.ViewTerms')}
                  </button>
                </React.Fragment>
              )}
            </p>
          </DialogBody>
          <DialogFooter className='flex flex-col'>
            <Button
              ref={confirmButtonRef}
              variant='Emphasis'
              size='Medium'
              className='fill'
              onClick={handleConfirmDismiss}>
              {translate('Action.Dialog.AddGearOk')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {hasTerms && (
        <Dialog
          open={showTermsModal}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setShowTermsModal(false);
            }
          }}
          isModal
          size='Medium'
          type='Default'
          ariaLabel={termsModalTitle}
          hasCloseAffordance={false}>
          <DialogContent className='marketplace-offer-modal-dialog-content'>
            <DialogBody className='marketplace-offer-modal-body flex flex-col gap-large'>
              <h2 className='marketplace-offer-modal-title'>{termsModalTitle}</h2>
              <p className='marketplace-offer-modal-terms-body'>{modal.termsBody}</p>
            </DialogBody>
            <DialogFooter className='flex flex-col'>
              <Button
                variant='Emphasis'
                size='Medium'
                className='fill'
                onClick={() => setShowTermsModal(false)}>
                {translate('Action.Dialog.AddGearOk')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </React.Fragment>
  );
};

export default withTranslations(MarketplaceOfferModal, translationConfig);
