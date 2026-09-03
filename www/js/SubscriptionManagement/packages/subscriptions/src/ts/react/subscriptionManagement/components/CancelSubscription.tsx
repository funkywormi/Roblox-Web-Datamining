import React, { useEffect, useState } from 'react';
import { fireEvent } from 'roblox-event-tracker';
import { useTranslation } from 'react-utilities';
import { Modal } from 'react-style-guide';
import { authenticatedUser, deviceMeta } from 'header-scripts';
import { ProductType } from '@rbx/client-subscriptions-api/v1';
import { PremiumPurchasePlatform } from '../../../core/types/premiumEnums';
import '../../../../css/subscriptionManagement/cancelSubscription.scss';
import { ANDROID_CANCEL_RENEWAL_URL } from '../../../core/constants/websiteConstants';
import {
  cancelPremiumSubscription,
  cancelUserSubscription
} from '../../../core/services/subscriptionServices';
import useSystemFeedbackContext from '../../shared/hooks/useSystemFeedback';
import { COUNTER_METRICS } from '../constants/metricConstants';
import { PremiumSubscription } from '../../../core/types/premiumSubscription';
import { UserSubscription } from '../../../core/types/userSubscription';
import trackerClient, { ManageEventType } from '../utils/logging';
import { isExpiring } from '../utils/subscriptionUtils';

type CancelSubscriptionProps = {
  className?: string;
  subscription: UserSubscription | PremiumSubscription;
  onCancel?: (isPremium: boolean, subscriptionTargetKey?: string) => void;
  isPremium?: boolean;
};

const CancelSubscription: React.FC<CancelSubscriptionProps> = ({
  className,
  subscription,
  onCancel,
  isPremium = false
}) => {
  const { translate } = useTranslation();

  // Keep track of whether the subscription has already been canceled
  // to show/hide the cancel button
  const [isCanceled, setIsCanceled] = useState(false);

  // Whether the modal that triggers cancelation is visible
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

  // Whether the modal that shows a cancelation error is visible
  const [isCancelErrorVisible, setIsCancelErrorVisible] = useState(false);

  const { systemFeedbackService } = useSystemFeedbackContext();

  const deviceMetaData = deviceMeta.getDeviceMeta();

  // Check if subscription is already canceled
  useEffect(() => {
    if (isExpiring(subscription.renewal, subscription.expiration)) {
      setIsCanceled(true);
    }
  }, [subscription.renewal, subscription.expiration]);

  const showCancelButton = () => {
    // After subscription is canceled once, hide the button
    if (isCanceled) {
      return false;
    }

    // Non premium subscriptions can be canceled on any platform
    if (!isPremium) {
      return true;
    }

    // Check premium cancellation
    const premiumSubscription = subscription as PremiumSubscription;
    return (
      // Desktop purchased can be cancelled on any platform
      premiumSubscription.purchasePlatform === PremiumPurchasePlatform.DESKTOP ||
      // Android purchased can only be cancelled on Android
      (premiumSubscription.purchasePlatform === PremiumPurchasePlatform.ANDROID_APP &&
        deviceMetaData?.isAndroidApp)
    );
  };

  const cancelSubscription = () => {
    let cancelCall: Promise<void>;
    if (isPremium) {
      fireEvent(COUNTER_METRICS.SUBSCRIPTIONS.CANCEL_CLICKED);
      if (
        (subscription as PremiumSubscription).purchasePlatform ===
          PremiumPurchasePlatform.ANDROID_APP &&
        deviceMetaData?.isAndroidApp
      ) {
        // Cancelling an Android premium on Android
        window.location.href = ANDROID_CANCEL_RENEWAL_URL;
        return;
      }
      cancelCall = cancelPremiumSubscription(authenticatedUser.id!);
    } else {
      cancelCall = cancelUserSubscription((subscription as UserSubscription).subscriptionTargetKey);
    }

    setIsCancelModalVisible(false);
    cancelCall
      .then(() => {
        systemFeedbackService.success(translate('Response.Subscriptions.CancelSuccess'));
        // This call isn't completely required since calling onCancel should trigger
        // the components up the tree updating the expiration time
        setIsCanceled(true);
        if (onCancel) {
          onCancel(isPremium, (subscription as UserSubscription).subscriptionTargetKey);
        }
        if (!isPremium) {
          trackerClient.sendEvent(ManageEventType.CANCEL_SUCCESS, subscription as UserSubscription);
        }
      })
      .catch(() => setIsCancelErrorVisible(true));
  };

  const cancelButtonClick = () => {
    if (!isPremium) {
      trackerClient.sendEvent(ManageEventType.CLICK_CANCEL, subscription as UserSubscription);
    }
    setIsCancelModalVisible(true);
  };

  const accessDateString = subscription.renewal.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <React.Fragment>
      {showCancelButton() && (
        <button type='button' className={className} onClick={cancelButtonClick}>
          {translate('Action.CancelRenewal')}
        </button>
      )}
      <Modal show={isCancelModalVisible} onHide={() => setIsCancelModalVisible(false)}>
        <Modal.Header
          className='cancel-modal-header'
          title={translate('Action.CancelSubscription')}
          showCloseButton
          onClose={() => setIsCancelModalVisible(false)}
        />
        <Modal.Body>
          {(subscription as UserSubscription).productType === ProductType.Blackbird ? (
            <React.Fragment>
              <p>
                {translate('Message.Subscriptions.PlusCancelBody', {
                  subscriptionExpirationDate: accessDateString
                })}
              </p>
              <p>{translate('Message.Subscriptions.PlusCancelBody2')}</p>
            </React.Fragment>
          ) : (
            translate('Message.Subscriptions.AccessUntil', {
              subscriptionExpirationDate: accessDateString
            })
          )}
        </Modal.Body>
        <Modal.Footer className='cancel-modal-footer'>
          <button
            type='button'
            className='btn-secondary-md btn-full-width'
            onClick={() => setIsCancelModalVisible(false)}>
            {translate('Action.Subscriptions.StopCancel')}
          </button>
          <button type='button' className='btn-cta-md btn-full-width' onClick={cancelSubscription}>
            {translate('Action.Subscriptions.CancelSubscription')}
          </button>
        </Modal.Footer>
      </Modal>
      <Modal show={isCancelErrorVisible} onHide={() => setIsCancelErrorVisible(false)}>
        <Modal.Header
          className='cancel-modal-header'
          title={translate('Heading.Dialog.DefaultError')}
          showCloseButton
          onClose={() => setIsCancelErrorVisible(false)}
        />
        <Modal.Body className='cancel-error-body'>
          {translate('Response.Subscriptions.CancelUnknownError')}
          <span className='icon-status-alert-xl' />
        </Modal.Body>
        <Modal.Footer className='cancel-modal-footer'>
          <button
            type='button'
            className='btn-cta-md btn-full-width'
            onClick={() => setIsCancelErrorVisible(false)}>
            {translate('Action.Dialog.Success')}
          </button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default CancelSubscription;
