/* eslint-disable no-void */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { Modal } from 'react-style-guide';
import { useTranslation } from 'react-utilities';
import { EnvironmentUrls } from 'Roblox';
import { PaymentProvider, SubscriptionErrorCodes } from '../../../core/types/subscriptionEnums';
import {
  FeatureSubscriptions,
  SubscriptionErrorCodesToModalContent
} from '../../../core/constants/translationConstants';
import StripeForm from './StripeForm';
import '../../../../css/shared/stripe.scss';
import { verifyPaymentProfileCreation } from '../../../core/services/paymentServices';
import {
  STRIPE_ERROR_CODES,
  TIME_BETWEEN_POLLS_IN_MS
} from '../../../core/constants/paymentConstants';
import useSystemFeedbackContext from '../../shared/hooks/useSystemFeedback';
import trackerClient, {
  SubscriptionInputType,
  SubscriptionPurchaseEventType,
  SubscriptionViewName
} from '../utils/logging';
import useGameSubscriptions from '../hooks/useGameSubscriptions';
import { purchaseWebSubscription } from '../utils/gameSubscriptionUtils';
import {
  DevSubscriptionEconomicRestrictionResponse,
  HttpServiceError
} from '../../../core/types/serviceTypes';
import useSingleButtonModalContext from '../../shared/hooks/useSingleButtonModal';
import { StripeAllowRedisplayOptions } from '../../../core/types/stripeTypes';
import getEconomicRestrictionErrorMsg from '../utils/ErrorMessaging';

type StripeModalProps = {
  showStripeModal: boolean;
  closeStripeModal: () => void;
};

const StripeModal = ({ showStripeModal, closeStripeModal }: StripeModalProps): JSX.Element => {
  const [isFormSubmitAllowed, setIsFormSubmitAllowed] = useState(false);
  const [stripeErrorCode, setStripeErrorCode] = useState<string | null>(null);
  const [inputEmail, setInputEmail] = useState('');
  const { translate } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const providerPaymentProfileId = useRef<string>('');
  const { systemFeedbackService } = useSystemFeedbackContext();
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useGameSubscriptions();
  const { purchaseFlowUuid, selectedSubscription, pathName } = state;
  const {
    updateModalContent,
    openModal,
    closeModal: closeErrorModal
  } = useSingleButtonModalContext();
  const [returnUrl, setReturnUrl] = useState('');

  const onFormStatusChange = useCallback((isSubmitAllowed: boolean) => {
    setIsFormSubmitAllowed(isSubmitAllowed);
  }, []);

  const verifyPaymentProfileCreationPoll = async () => {
    try {
      const response = await verifyPaymentProfileCreation(providerPaymentProfileId.current);
      if (response) {
        return true;
      }
    } catch (e) {
      // We can ignore this as we can expect verification to fail (hence the polling)
      // We can choose to add event tracking here but it isn't P0
    }
    return false;
  };

  const poll = useCallback(
    async (fn: () => Promise<boolean>, interval: number, times: number) => {
      try {
        const result = await fn();
        if (result && selectedSubscription) {
          void purchaseWebSubscription(
            () => {
              systemFeedbackService.warning(translate(FeatureSubscriptions.ErrorGenericError));
              closeStripeModal();
            },
            (serviceError: HttpServiceError) => {
              const { errorCode } = serviceError.data;

              setIsLoading(false);
              switch (errorCode) {
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
                  openModal();
                  break;
                default:
                  systemFeedbackService.warning(translate(FeatureSubscriptions.ErrorGenericError));
              }
              closeStripeModal();
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
              closeStripeModal();
              openModal();
            },
            () => {
              setIsLoading(false);
              closeStripeModal();
            },
            selectedSubscription,
            purchaseFlowUuid,
            pathName,
            PaymentProvider.STRIPE
          );
          setIsLoading(false);
          closeStripeModal();
          return;
        }
        if (times === 0) {
          systemFeedbackService.warning(
            translate(FeatureSubscriptions.ErrorStripeSavedCardSomethingWentWrong)
          );
          setIsLoading(false);
          closeStripeModal();
          return;
        }
        setTimeout(() => {
          void poll(fn, interval, times - 1);
        }, interval);
      } catch (e) {
        systemFeedbackService.warning(translate(FeatureSubscriptions.ErrorGenericError));
        closeStripeModal();
      }
    },
    [
      closeErrorModal,
      closeStripeModal,
      openModal,
      pathName,
      purchaseFlowUuid,
      selectedSubscription,
      systemFeedbackService,
      translate,
      updateModalContent
    ]
  );

  const onFormSubmit = useCallback(async () => {
    if (!stripe || !elements) {
      closeStripeModal();
      return;
    }

    setIsLoading(true);
    setStripeErrorCode(null);

    if (selectedSubscription) {
      trackerClient.sendExperienceSubscriptionEvent(
        purchaseFlowUuid,
        SubscriptionPurchaseEventType.USER_INPUT,
        SubscriptionViewName.VPC_NEW_PAYMENT_MODAL,
        selectedSubscription,
        SubscriptionInputType.SAVE_NEW_PAYMENT_METHOD
      );
    }

    const allowRedisplayValue: StripeAllowRedisplayOptions = 'always';

    const confirmParams = {
      return_url: returnUrl,
      payment_method_data: {
        billing_details: {
          email: inputEmail
        },
        allow_redisplay: allowRedisplayValue
      }
    };

    try {
      const response = await stripe.confirmSetup({
        elements,
        confirmParams,
        redirect: 'if_required'
      });

      if (response?.setupIntent?.status === 'succeeded') {
        providerPaymentProfileId.current = response?.setupIntent?.payment_method?.toString() ?? '';
        if (providerPaymentProfileId.current) {
          void poll(verifyPaymentProfileCreationPoll, TIME_BETWEEN_POLLS_IN_MS, 3);
        }
      } else if (response?.error?.code) {
        switch (response.error.code) {
          case STRIPE_ERROR_CODES.INCORRECT_CVC:
          case STRIPE_ERROR_CODES.EXPIRED_CARD:
            setStripeErrorCode(response?.error?.code);
            break;
          case STRIPE_ERROR_CODES.CARD_DECLINED:
            systemFeedbackService.warning(translate(FeatureSubscriptions.ErrorStripeCardDeclined));
            closeStripeModal();
            break;
          default:
            systemFeedbackService.warning(
              translate(FeatureSubscriptions.ErrorStripeSaveCardGeneralError)
            );
            closeStripeModal();
        }
        setIsLoading(false);
      }
    } catch (e) {
      closeStripeModal();
      setIsLoading(false);
    }
  }, [
    stripe,
    elements,
    selectedSubscription,
    returnUrl,
    inputEmail,
    closeStripeModal,
    purchaseFlowUuid,
    poll,
    systemFeedbackService,
    translate
  ]);

  useEffect(() => {
    setReturnUrl(`${EnvironmentUrls.websiteUrl}/${pathName}`);
  }, [pathName]);

  return (
    <Modal show={showStripeModal} onHide={closeStripeModal} size='md' className='rbx-stripe-modal'>
      <Modal.Header
        title={translate(FeatureSubscriptions.HeadingAddPaymentMethod)}
        onClose={closeStripeModal}
      />
      <Modal.Body>
        <StripeForm
          onFormStatusChange={onFormStatusChange}
          elements={elements}
          inputEmail={inputEmail}
          setInputEmail={setInputEmail}
          stripeErrorCode={stripeErrorCode}
        />
      </Modal.Body>
      <Modal.Footer>
        {isLoading ? (
          <span className='spinner spinner-default' />
        ) : (
          <div className='modal-buttons'>
            <button
              type='button'
              className='modal-button btn-primary-md btn-min-width'
              disabled={!isFormSubmitAllowed}
              onClick={onFormSubmit}>
              {translate('Action.Save')}
            </button>
            <button
              type='button'
              className='modal-button btn-control-md btn-min-width'
              onClick={closeStripeModal}>
              {translate('Action.Cancel')}
            </button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default StripeModal;
