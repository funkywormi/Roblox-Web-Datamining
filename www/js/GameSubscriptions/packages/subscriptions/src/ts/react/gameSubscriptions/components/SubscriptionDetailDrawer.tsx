import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from 'roblox-thumbnails';
import { Button, Icon, Chip, Divider, Snackbar } from '@rbx/foundation-ui';
import { Subscription } from '../../../core/types/serviceTypes';
import { FeatureSubscriptions } from '../../../core/constants/translationConstants';
import { isRobuxSubscription } from '../utils/gameSubscriptionUtils';
import '../../../../css/gameSubscriptions/subscriptionDetailDrawer.scss';

type TSubscriptionDetailDrawerProps = {
  show: boolean;
  subscription: Subscription;
  onClose: () => void;
  onSubscribe: () => void;
  onReport: () => void;
  translate: (key: string) => string;
};

const SubscriptionDetailDrawer = ({
  show,
  subscription,
  onClose,
  onSubscribe,
  onReport,
  translate
}: TSubscriptionDetailDrawerProps): JSX.Element | null => {
  const {
    name,
    subscriptionProviderName,
    description,
    displayPrice,
    iconImageAssetId,
    isForSale
  } = subscription;

  const isRobux = isRobuxSubscription(subscription);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollBodyRef = useRef<HTMLDivElement>(null);

  const checkScrollBottom = useCallback(() => {
    const el = scrollBodyRef.current;
    if (!el) return;
    const threshold = 2;
    setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight <= threshold);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (show) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(checkScrollBottom);
    } else {
      setIsAtBottom(false);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [show, handleKeyDown, checkScrollBottom]);

  const handleShare = useCallback(async () => {
    try {
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      const shareUrl = `${baseUrl}#!/store?subscription=${encodeURIComponent(
        subscription.subscriptionTargetKey
      )}`;
      await navigator.clipboard.writeText(shareUrl);
      setShowSnackbar(true);
    } catch {
      // Fallback: no-op if clipboard not available
    }
  }, [subscription.subscriptionTargetKey]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const drawerContent = (
    <React.Fragment>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={`subscription-drawer-overlay${show ? ' open' : ''}`}
        onClick={handleOverlayClick}
      />
      <div className={`subscription-drawer${show ? ' open' : ''}`}>
        <div className='subscription-drawer-header'>
          <Icon name='icon-filled-x' size='Large' onClick={onClose} />
        </div>

        <div className='subscription-drawer-body' ref={scrollBodyRef} onScroll={checkScrollBottom}>
          <div className='drawer-thumbnail-container-wrapper'>
            <div className='drawer-thumbnail-container'>
              <Thumbnail2d
                type={ThumbnailTypes.assetThumbnail}
                size={DefaultThumbnailSize}
                targetId={iconImageAssetId}
                altName={name}
                imgClassName='subscription-thumbnail'
                containerClass='subscription-thumbnail'
              />
            </div>
          </div>

          <span className='text-heading-small content-emphasis drawer-sub-name'>{name}</span>
          <p className='text-body-large content-default drawer-provider-name'>
            {subscriptionProviderName}
          </p>

          {isForSale && (
            <div className='drawer-price-row'>
              {isRobux ? (
                <React.Fragment>
                  <Icon name='icon-filled-robux' size='Small' className='content-emphasis' />
                  <span className='text-title-large content-emphasis'>{displayPrice}</span>
                </React.Fragment>
              ) : (
                <span className='text-title-large content-emphasis'>{displayPrice}</span>
              )}
              <span className='text-title-large content-emphasis drawer-price-cadence'>
                {translate(FeatureSubscriptions.LabelPerMonth)}
              </span>
            </div>
          )}

          <div className='drawer-chips-row'>
            <Chip
              size='Medium'
              text={translate(FeatureSubscriptions.ActionShare)}
              variant='Standard'
              isChecked={false}
              leading='icon-regular-arrow-thick-to-right'
              onCheckedChange={handleShare}
            />
            <Chip
              size='Medium'
              text={translate(FeatureSubscriptions.ActionReport)}
              variant='Standard'
              isChecked={false}
              leading='icon-regular-flag'
              onCheckedChange={onReport}
            />
          </div>

          <div className='font-body drawer-description'>{description}</div>
        </div>

        <div className='subscription-drawer-footer'>
          {!isAtBottom && <Divider orientation='horizontal' variant='Standard' />}
          <Button
            as='button'
            size='Large'
            variant='Emphasis'
            isDisabled={!isForSale}
            onClick={onSubscribe}>
            {isForSale
              ? translate(FeatureSubscriptions.ActionSubscribe)
              : translate(FeatureSubscriptions.LabelSubscribed)}
          </Button>
        </div>
      </div>
      {showSnackbar && (
        <div className='subscription-drawer-snackbar'>
          <Snackbar
            title={translate(FeatureSubscriptions.MessageLinkCopied)}
            shouldAutoDismiss
            onClose={() => setShowSnackbar(false)}
          />
        </div>
      )}
    </React.Fragment>
  );

  return ReactDOM.createPortal(drawerContent, document.body);
};

export default SubscriptionDetailDrawer;
