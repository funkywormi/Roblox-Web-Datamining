/* eslint-disable no-void */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { Thumbnail2d, ThumbnailTypes } from 'roblox-thumbnails';
import { Button, Modal } from 'react-style-guide';
import '../../../../css/gameSubscriptions/subscriptionModal.scss';
import {
  CommonVerifiedParentalConsent,
  FeatureSubscriptions,
  SubscriptionErrorCodesToModalContent
} from '../../../core/constants/translationConstants';
import { PaymentProvider, SubscriptionErrorCodes } from '../../../core/types/subscriptionEnums';
import { BILLING_SETTING_URL } from '../../../core/constants/websiteConstants';
import {
  DevSubscriptionEconomicRestrictionResponse,
  HttpServiceError,
  Subscription,
  SubscriptionPurchaseErrorResponse
} from '../../../core/types/serviceTypes';
import useSystemFeedbackContext from '../../shared/hooks/useSystemFeedback';
import useSingleButtonModalContext from '../../shared/hooks/useSingleButtonModal';
import useGameSubscriptions from '../hooks/useGameSubscriptions';
import trackerClient, {
  SubscriptionInputType,
  SubscriptionPurchaseEventType,
  SubscriptionViewName
} from '../utils/logging';
import { GameSubscriptionActionTypes } from '../utils/GameSubscriptionActions';
import {
  purchaseWebSubscription,
  purchaseRobuxWebSubscription,
  isRobuxSubscription
} from '../utils/gameSubscriptionUtils';
import getEconomicRestrictionErrorMsg from '../utils/ErrorMessaging';


type TSubscriptionModalProps = {
  title: string;
  show: boolean;
  assetId: number;
  provider: string;
  name: string;
  displayPrice: string;
  description: string;
  isForSale: boolean;
  cadence: string;
  cadenceDisclaimer: string;
  closeModal: () => void;
  primaryPaymentProviderType: string;
  allPaymentProviderTypes: string[];
  subscription: Subscription;
};

const SubscriptionModal = ({
  title,
  show,
  assetId,
  provider,
  name,
  displayPrice,
  description,
  isForSale,
  cadence,
  cadenceDisclaimer,
  closeModal,
  primaryPaymentProviderType,
  allPaymentProviderTypes,
  subscription
}: TSubscriptionModalProps): JSX.Element => {
  const { systemFeedbackService } = useSystemFeedbackContext();
  const {
    updateModalContent,
    openModal,
    closeModal: closeErrorModal
  } = useSingleButtonModalContext();
  const [isLoading, setIsLoading] = useState(true);
  const { translate } = useTranslation();
  const { state, dispatch } = useGameSubscriptions();
  const { purchaseFlowUuid, pathName } = state;
  const use2button = allPaymentProviderTypes.length > 1;

  const goToPaymentSettingsUrl = useCallback(() => {
    trackerClient.sendExperienceSubscriptionEvent(
      purchaseFlowUuid,
      SubscriptionPurchaseEventType.USER_INPUT,
      SubscriptionViewName.PURCHASE_DISABLED_PAYMENT_MODAL,
      subscription,
      SubscriptionInputType.ASK_PARENT_BUTTON
    );
    window.location.href = BILLING_SETTING_URL;
  }, [purchaseFlowUuid, subscription]);

  const isRobux = isRobuxSubscription(subscription);

  const buySubscription = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, paymentProvider: string) => {
      trackerClient.sendExperienceSubscriptionEvent(
        purchaseFlowUuid,
        SubscriptionPurchaseEventType.USER_INPUT,
        SubscriptionViewName.PURCHASE_MODAL,
        subscription,
        SubscriptionInputType.SUBSCRIBE
      );
      // TODO jkohn: how to model paymentProvider in event

      e.stopPropagation();
      setIsLoading(true);

      if (isRobux) {
        const handleDone = () => {
          setIsLoading(false);
          closeModal();
        };

        const showError = (msg?: string) => {
          systemFeedbackService.warning(msg || translate(FeatureSubscriptions.ErrorGenericError));
          handleDone();
        };

        void purchaseRobuxWebSubscription(
          () => {
            dispatch({
              type: GameSubscriptionActionTypes.MARK_SUBSCRIBED,
              subscriptionTargetKey: subscription.subscriptionTargetKey
            });
            handleDone();
          },
          showError,
          (serviceError: HttpServiceError) => {
            const { errorMessage } = serviceError.data as { errorMessage: string };
            showError(errorMessage);
          },
          subscription,
          purchaseFlowUuid
        );
        return;
      }

      void purchaseWebSubscription(
        () => {
          systemFeedbackService.warning(translate(FeatureSubscriptions.ErrorGenericError));
          closeModal();
        },
        (serviceError: HttpServiceError) => {
          const { clientHint, errorCode } = serviceError.data as SubscriptionPurchaseErrorResponse;

          setIsLoading(false);
          switch (errorCode) {
            case SubscriptionErrorCodes.SAVED_CC_REQUIRED:
              closeModal();
              if (clientHint) {
                dispatch({
                  type: GameSubscriptionActionTypes.OPEN_STRIPE_MODAL,
                  clientSecret: clientHint,
                  subscription
                });
              } else {
                systemFeedbackService.warning(translate(FeatureSubscriptions.ErrorGenericError));
              }
              break;
            case SubscriptionErrorCodes.VPC_REQUIRED:
              trackerClient.sendExperienceSubscriptionEvent(
                purchaseFlowUuid,
                SubscriptionPurchaseEventType.VIEW_SHOWN,
                SubscriptionViewName.PURCHASE_DISABLED_PAYMENT_MODAL,
                subscription,
                SubscriptionInputType.SUBSCRIBE
              );
              updateModalContent(
                translate(CommonVerifiedParentalConsent.LabelAskParent),
                translate(CommonVerifiedParentalConsent.DescriptionSpendingRestrictionWithSettings),
                translate(CommonVerifiedParentalConsent.ActionGoToSettings),
                false,
                () => goToPaymentSettingsUrl,
                translate(CommonVerifiedParentalConsent.ActionCancel)
              );
              closeModal();
              openModal();
              break;
            case SubscriptionErrorCodes.EXCEED_PARENTAL_SPEND_LIMIT:
            case SubscriptionErrorCodes.USER_HAS_SPEND_LIMIT_SET:
            case SubscriptionErrorCodes.RESTRICTED_USER:
            case SubscriptionErrorCodes.UNSUPPORTED_LOCALE:
              updateModalContent(
                translate(FeatureSubscriptions.HeadingCannotSubscribe),
                translate(SubscriptionErrorCodesToModalContent[errorCode] ?? '') ??
                  translate(FeatureSubscriptions.ErrorGenericError),
                translate('Action.OK'),
                true,
                () => closeErrorModal
              );
              closeModal();
              openModal();
              break;
            default:
              systemFeedbackService.warning(translate(FeatureSubscriptions.ErrorGenericError));
          }
          closeModal();
        },
        (response: DevSubscriptionEconomicRestrictionResponse) => {
          setIsLoading(false);
          updateModalContent(
            translate(FeatureSubscriptions.HeadingCannotSubscribe),
            getEconomicRestrictionErrorMsg(
              translate,
              response.failureReason,
              response.expirationTimeInMinutes
            ),
            translate('Action.OK'),
            true,
            () => closeErrorModal
          );
          closeModal();
          openModal();
        },
        () => setIsLoading(false),
        subscription,
        purchaseFlowUuid,
        pathName,
        paymentProvider
      );
    },
    [
      closeErrorModal,
      closeModal,
      dispatch,
      isRobux,
      openModal,
      pathName,
      purchaseFlowUuid,
      subscription,
      systemFeedbackService,
      translate,
      updateModalContent
    ]
  );

  useEffect(() => {
    if (isRobux || primaryPaymentProviderType) {
      setIsLoading(false);
    }
  }, [isRobux, primaryPaymentProviderType]);

  const footerElement = useMemo(() => {
    if (!isForSale) {
      return (
        <Button
          width={Button.widths.full}
          size={Button.sizes.large}
          onClick={e => buySubscription(e, primaryPaymentProviderType)}
          isDisabled>
          {translate(FeatureSubscriptions.LabelSubscribed)}
        </Button>
      );
    }

    // Current behavior fallback.
    // We will launch the new payment provider choices by enabling backend flag to return at least 2 options in allPaymentProviderTypes.
    if (!use2button) {
      return (
        <Button
          width={Button.widths.full}
          size={Button.sizes.large}
          onClick={e => buySubscription(e, PaymentProvider.STRIPE)}>
          {translate(FeatureSubscriptions.ActionSubscribe)}
        </Button>
      );
    }

    // Write logic for 2 buttons rather than N buttons. When we have more than 2, we'll likely route PayAnotherWay to a payment selection page.
    let primaryButtonTranslationKey = FeatureSubscriptions.ActionSubscribeWithCreditDebitCard;
    const secondaryButtonTranslationKey = FeatureSubscriptions.ActionSubscribePayAnotherWay;
    const secondaryPaymentProviderType = allPaymentProviderTypes[1];
    if (primaryPaymentProviderType === PaymentProvider.CREDITBALANCE) {
      primaryButtonTranslationKey = FeatureSubscriptions.ActionSubscribeWithRobloxCredit;
    }
    return (
      <div>
        <Button
          width={Button.widths.full}
          size={Button.sizes.large}
          onClick={e => buySubscription(e, primaryPaymentProviderType)}>
          {translate(primaryButtonTranslationKey) || primaryPaymentProviderType}
        </Button>
        <Button
          width={Button.widths.full}
          size={Button.sizes.large}
          className='btn-secondary-lg btn-secondary-margin'
          onClick={e => buySubscription(e, secondaryPaymentProviderType || '')}>
          {translate(secondaryButtonTranslationKey) || secondaryPaymentProviderType}
        </Button>
      </div>
    );
  }, [
    isForSale,
    use2button,
    allPaymentProviderTypes,
    primaryPaymentProviderType,
    translate,
    buySubscription
  ]);

  return (
    <Modal
      show={show}
      onHide={closeModal}
      size='md'
      className='rbx-subscription-modal'
      centered
      scrollable={false}>
      <Modal.Header title={title} showCloseButton onClose={closeModal} />
      <Modal.Body>
        <div className='modal-body-sub-info'>
          <div className='thumbnail-container'>
            <Thumbnail2d
              type={ThumbnailTypes.assetThumbnail}
              targetId={assetId}
              altName={name}
              imgClassName='subscription-thumbnail'
              containerClass='subscription-thumbnail'
            />
          </div>
          <span className='font-header-2 text-emphasis sub-info sub-text-normal'>{provider}</span>
          <span className='font-header-1 text-emphasis sub-info sub-text-title'>{name}</span>
          <span className='sub-info'>
            <span className='font-header-2 text-emphasis sub-text-normal'>{displayPrice}</span>
            <span className='font-header-2 text-default sub-text-normal'>{cadence}</span>
          </span>
          <span className='font-header-2 text-default sub-info sub-text-normal'>
            {cadenceDisclaimer}
          </span>
        </div>
        <div className='font-header-2 text-default description sub-info sub-text-normal'>
          {description}
        </div>
      </Modal.Body>
      <Modal.Footer className={use2button ? 'modal-footer-2-button' : ''}>
        {isLoading ? <span className='spinner spinner-default' /> : footerElement}
      </Modal.Footer>
    </Modal>
  );
};

export default SubscriptionModal;
