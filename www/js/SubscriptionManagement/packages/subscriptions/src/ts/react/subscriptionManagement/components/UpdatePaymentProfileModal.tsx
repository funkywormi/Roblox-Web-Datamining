/* eslint-disable react/jsx-no-literals */
import { Button, Modal } from 'react-style-guide';
import { useTranslation } from 'react-utilities';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { fireEvent } from 'roblox-event-tracker';
import { UserSubscription } from '../../../core/types/userSubscription';
import {
  STRIPE_ERROR_CODES,
  TIME_BETWEEN_POLLS_IN_MS
} from '../../../core/constants/paymentConstants';
import { SavedPaymentProfile } from '../../../core/types/savedPaymentProfile';

import '../../../../css/subscriptionManagement/updatePaymentProfileModal.scss';
import { updateSubscriptionPaymentProfile } from '../../../core/services/subscriptionServices';
import useSystemFeedbackContext from '../../shared/hooks/useSystemFeedback';
import StripeForm from '../../shared/components/StripeForm';
import { GetStripeCardIcon } from '../../../core/utils/paymentUtils';
import { StripeAllowRedisplayOptions } from '../../../core/types/stripeTypes';
import {
  deletePaymentProfile,
  updatePaymentProfileDetails,
  verifyPaymentProfileCreation
} from '../../../core/services/paymentServices';
import {
  GetDateFromFormattedExpiration,
  GetFormattedExpiration,
  GetMonthAndYearFromFormattedExpiration
} from '../../../core/utils/dateUtils';
import { COUNTER_METRICS } from '../constants/metricConstants';
import { PremiumSubscription } from '../../../core/types/premiumSubscription';
import trackerClient, { ManageEventType } from '../utils/logging';

type UpdatePaymentProfileModalProps = {
  subscriptionId: string;
  paymentProfiles: SavedPaymentProfile[];
  defaultPaymentProfile: SavedPaymentProfile;
  isOpen: boolean;
  isUserUnder18: boolean;
  subscription: UserSubscription | PremiumSubscription;
  onClose: () => void;
  onSave: (paymentProfile: SavedPaymentProfile) => void;
  onPaymentProfileExpirationUpdate: (
    paymentProfile: SavedPaymentProfile,
    expirationMonth: number,
    expirationYear: number
  ) => void;
  fetchSavedPaymentProfiles: () => Promise<SavedPaymentProfile[]>;
};

const UpdatePaymentProfileModal: React.FC<UpdatePaymentProfileModalProps> = ({
  subscriptionId,
  paymentProfiles,
  defaultPaymentProfile,
  isOpen,
  isUserUnder18,
  subscription,
  onClose,
  onSave,
  onPaymentProfileExpirationUpdate,
  fetchSavedPaymentProfiles
}) => {
  const { translate } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [stripeErrorCode, setStripeErrorCode] = useState<string | null>(null);
  const [selectedPaymentProfile, setSelectedPaymentProfile] = useState<SavedPaymentProfile>(
    defaultPaymentProfile
  );
  const [showSelectionDropdown, setShowSelectionDropdown] = useState<boolean>(false);
  const [expiration, setExpiration] = useState<string>(
    GetFormattedExpiration(
      defaultPaymentProfile.providerPayload.ExpMonth,
      defaultPaymentProfile.providerPayload.ExpYear
    )
  );
  const { systemFeedbackService } = useSystemFeedbackContext();
  const [showStripeAddCardForm, setShowStripeAddCardForm] = useState(false);
  const [expirationError, setExpirationError] = React.useState<boolean>(false);

  const selectDropdownList = useRef<HTMLDivElement>(null);

  const stripe = useStripe();
  const elements = useElements();
  const providerPaymentProfileId = useRef<string>('');

  useEffect(() => {
    if (showStripeAddCardForm) {
      return;
    }

    const initialDate = new Date(
      selectedPaymentProfile.providerPayload.ExpYear,
      selectedPaymentProfile.providerPayload.ExpMonth - 1
    );
    const proposedDate = GetDateFromFormattedExpiration(expiration);
    const startOfTheMonth = new Date(new Date().getFullYear(), new Date().getMonth());

    setCanSubmit(
      (proposedDate !== initialDate && proposedDate >= startOfTheMonth) ||
        selectedPaymentProfile.id !== defaultPaymentProfile.id
    );
    setExpirationError(proposedDate < startOfTheMonth || proposedDate < initialDate);
  }, [defaultPaymentProfile.id, expiration, selectedPaymentProfile, showStripeAddCardForm]);

  const closeDropdown = useCallback(() => {
    if (selectDropdownList.current?.scrollTop) {
      selectDropdownList.current.scrollTop = 0;
    }
    setShowSelectionDropdown(false);
  }, []);

  const closeModal = useCallback(() => {
    setShowStripeAddCardForm(false);
    closeDropdown();
    setCanSubmit(false);
    setLoading(false);
    onClose();
  }, [closeDropdown, onClose]);

  const updatePaymentProfile = useCallback(
    async (paymentProfileId: string, exp: string) => {
      trackerClient.sendEvent(ManageEventType.CLICK_UPDATE_PAYMENT_METHOD, subscription);
      setLoading(true);
      setCanSubmit(false);

      let successMessage;

      if (exp) {
        const expDate = GetDateFromFormattedExpiration(exp);
        const currentCardExpirationDate = new Date(
          selectedPaymentProfile.providerPayload.ExpYear,
          selectedPaymentProfile.providerPayload.ExpMonth - 1
        );

        if (expDate > currentCardExpirationDate) {
          const [month, year] = GetMonthAndYearFromFormattedExpiration(exp);
          try {
            fireEvent(COUNTER_METRICS.API.UPDATE_SAVED_PAYMENT_PROFILE_CALLED);
            await updatePaymentProfileDetails(paymentProfileId, month, year);
            successMessage = 'Description.PaymentExpirationUpdateSuccess';
            trackerClient.sendEvent(
              ManageEventType.UPDATE_PAYMENT_METHOD_EXPIRATION_SUCCESS,
              subscription
            );
            fireEvent(COUNTER_METRICS.API.UPDATE_SAVED_PAYMENT_PROFILE_SUCCEEDED);
            onPaymentProfileExpirationUpdate(selectedPaymentProfile, month, year);
          } catch (e) {
            fireEvent(COUNTER_METRICS.API.UPDATE_SAVED_PAYMENT_PROFILE_FAILED);
            trackerClient.sendEvent(
              ManageEventType.UPDATE_PAYMENT_METHOD_EXPIRATION_FAILURE,
              subscription
            );
            systemFeedbackService.warning(translate('Error.PaymentMethodUpdateFailed'));
            successMessage = '';
          }
        }
      }

      // Only update if the expiration date was updated successfully or was not updated at all.
      if (successMessage !== '' && paymentProfileId !== defaultPaymentProfile.id) {
        try {
          fireEvent(COUNTER_METRICS.API.UPDATE_SAVED_PAYMENT_PROFILE_CALLED);
          await updateSubscriptionPaymentProfile(subscriptionId, paymentProfileId);
          fireEvent(COUNTER_METRICS.API.UPDATE_SAVED_PAYMENT_PROFILE_SUCCEEDED);
          trackerClient.sendEvent(ManageEventType.UPDATE_PAYMENT_METHOD_SUCCESS, subscription);
          successMessage = 'Message.PaymentUpdateSuccess';
          if (isUserUnder18) {
            try {
              // If the user is under 18, we want to delete the old (likely allow_redisplay: limited) payment profile
              fireEvent(COUNTER_METRICS.API.DELETE_SAVED_PAYMENT_PROFILE_CALLED);
              await deletePaymentProfile(defaultPaymentProfile.id);
              fireEvent(COUNTER_METRICS.API.DELETE_SAVED_PAYMENT_PROFILE_SUCCEEDED);
            } catch (e) {
              fireEvent(COUNTER_METRICS.API.DELETE_SAVED_PAYMENT_PROFILE_FAILED);
              throw e;
            }
          }
        } catch (e) {
          fireEvent(COUNTER_METRICS.API.UPDATE_SAVED_PAYMENT_PROFILE_FAILED);
          trackerClient.sendEvent(ManageEventType.UPDATE_PAYMENT_METHOD_FAILURE, subscription);
          systemFeedbackService.warning(translate('Error.PaymentMethodUpdateFailed'));
          closeDropdown();
          setLoading(false);
          closeModal();
        }
      }

      closeDropdown();
      setLoading(false);

      if (successMessage !== undefined && successMessage !== '') {
        systemFeedbackService.success(translate(successMessage));
        if (successMessage === 'Message.PaymentUpdateSuccess') {
          let paymentProfile = paymentProfiles.find(profile => profile.id === paymentProfileId);
          if (paymentProfile === undefined) {
            // new card is created so we need to fetch the details again
            const updatedPaymentProfiles = await fetchSavedPaymentProfiles();
            paymentProfile = updatedPaymentProfiles.find(
              profile => profile.id === paymentProfileId
            );
          }
          onSave(paymentProfile as SavedPaymentProfile);
        }
      }

      closeModal();
    },
    [
      closeDropdown,
      closeModal,
      defaultPaymentProfile.id,
      fetchSavedPaymentProfiles,
      isUserUnder18,
      onPaymentProfileExpirationUpdate,
      onSave,
      paymentProfiles,
      selectedPaymentProfile,
      subscription,
      subscriptionId,
      systemFeedbackService,
      translate
    ]
  );

  const verifyPaymentProfileCreationPoll = useCallback(async () => {
    try {
      const response = await verifyPaymentProfileCreation(providerPaymentProfileId.current);
      if (response) {
        return response;
      }
    } catch (e) {
      // We can ignore this as we can expect verification to fail (hence the polling)
    }
    return '';
  }, []);

  const poll = useCallback(
    async (fn: () => Promise<string>, interval: number, times: number) => {
      try {
        const result = await fn();
        if (result !== undefined && result !== '') {
          await updatePaymentProfile(result, '');
          trackerClient.sendEvent(
            ManageEventType.UPDATE_PAYMENT_METHOD_ADD_CARD_SUCCESS,
            subscription
          );
          setLoading(false);
          return;
        }
        if (times === 0) {
          setLoading(false);
          return;
        }
        setTimeout(async () => {
          await poll(fn, interval, times - 1);
        }, interval);
      } catch (e) {
        systemFeedbackService.warning(
          translate('Description.SavedCreditCard.SavePaymentMethodSomethingWentWrong')
        );
      }
    },
    [subscription, systemFeedbackService, translate, updatePaymentProfile]
  );

  const addAndUpdatePaymentProfile = useCallback(async () => {
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const allowRedisplayValue: StripeAllowRedisplayOptions = isUserUnder18 ? 'limited' : 'always';

    const confirmParams = {
      payment_method_data: {
        billing_details: {},
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
          await poll(verifyPaymentProfileCreationPoll, TIME_BETWEEN_POLLS_IN_MS, 3);
        }
        if (allowRedisplayValue === 'limited') {
          fireEvent(COUNTER_METRICS.SUBSCRIPTIONS.UPDATE_PAYMENT_METHOD_ADD_LIMITED_CARD_SUCCESS);
        }
      } else if (response?.error?.code) {
        trackerClient.sendEvent(
          ManageEventType.UPDATE_PAYMENT_METHOD_ADD_CARD_FAILURE,
          subscription
        );
        switch (response.error.code) {
          case STRIPE_ERROR_CODES.INCORRECT_CVC:
          case STRIPE_ERROR_CODES.EXPIRED_CARD:
            setStripeErrorCode(response?.error?.code);
            break;
          case STRIPE_ERROR_CODES.CARD_DECLINED:
            systemFeedbackService.warning(
              translate('Description.SavedCreditCard.CardDeclinedErrorMessage')
            );
            closeModal();
            break;
          default:
            systemFeedbackService.warning(translate('MessageUnknownError'));
        }
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
    }
  }, [
    stripe,
    elements,
    isUserUnder18,
    poll,
    verifyPaymentProfileCreationPoll,
    subscription,
    systemFeedbackService,
    translate,
    closeModal
  ]);

  const renderPaymentMethod = useCallback((paymentProfile: SavedPaymentProfile) => {
    return (
      <div className='payment-method-container'>
        <span
          className={classNames(
            'card-icon',
            GetStripeCardIcon(paymentProfile.providerPayload.CardNetwork)
          )}
        />
        <span className='card-four-digits text-emphasis'>
          ****{paymentProfile.providerPayload.Last4Digits}
        </span>
      </div>
    );
  }, []);

  const updateDisclosure = {
    __html: translate('Description.SavedCreditCard.StripeUpdatePaymentMethodDisclosure', {
      RobloxTermsLinkStart:
        '<a href="https://help.roblox.com/hc/articles/115004647846-Roblox-Terms-of-Use" class="text-link" target="_blank">',
      RobloxTermsLinkEnd: '</a>',
      RobloxPrivacyPolicyLinkStart: `<a href='https://help.roblox.com/hc/articles/115004630823-Roblox-Privacy-and-Cookie-Policy' class="text-link" target="_blank">`,
      RobloxPrivacyPolicyLinkEnd: '</a>',
      StripeTermsOfUseLinkStart:
        '<a href="https://stripe.com/legal/end-users" class="text-link" target="_blank">',
      StripeTermsOfUseLinkEnd: '</a>',
      StripePrivacyPolicyLinkStart: `<a href='https://stripe.com/privacy' class="text-link" target="_blank">`,
      StripePrivacyPolicyLinkEnd: '</a>'
    })
  };

  const renderDropdownSelectionButton = useCallback(
    (paymentProfile: SavedPaymentProfile) => {
      return (
        <button
          type='button'
          className='dropdown-selection-button'
          key={paymentProfile.id}
          onClick={() => {
            setSelectedPaymentProfile(paymentProfile);
            setLoading(paymentProfile.id === defaultPaymentProfile.id);
            setExpiration(
              GetFormattedExpiration(
                paymentProfile.providerPayload.ExpMonth,
                paymentProfile.providerPayload.ExpYear
              )
            );
            closeDropdown();
            setShowStripeAddCardForm(false);
            setCanSubmit(true);
          }}>
          {renderPaymentMethod(paymentProfile)}
        </button>
      );
    },
    [closeDropdown, defaultPaymentProfile.id, renderPaymentMethod]
  );

  if (defaultPaymentProfile === undefined) {
    return <Fragment />;
  }

  return (
    <Modal
      show={isOpen}
      onHide={closeModal}
      size='md'
      className='subscription-update-payment-method'>
      <Modal.Header
        title={translate('Heading.SavedCreditCard.UpdatePaymentMethod')}
        onClose={closeModal}
      />
      <Modal.Body>
        <div className='modal-description font-header-2 text-emphasis'>
          {translate('Heading.SavedCreditCard.CreditOrDebitCard')}
        </div>
        <div className='custom-select'>
          <button
            id='select-payment-profile-button'
            type='button'
            role='combobox'
            className={classNames('select-button', { active: showSelectionDropdown })}
            aria-labelledby='select-payment-profile-button'
            aria-haspopup='listbox'
            aria-expanded='false'
            aria-controls='select-payment-profile-dropdown'
            onClick={() => {
              if (showSelectionDropdown) {
                closeDropdown();
              } else {
                setShowSelectionDropdown(true);
              }
            }}>
            {!showStripeAddCardForm && renderPaymentMethod(selectedPaymentProfile)}
            {showStripeAddCardForm && (
              <span className='text-emphasis'>{translate('Heading.NewCreditOrDebitCard')}</span>
            )}
            <span className={showSelectionDropdown ? 'icon-up' : 'icon-down'} />
          </button>
          <div
            id='select-payment-profile-dropdown'
            role='listbox'
            ref={selectDropdownList}
            className={classNames('select-dropdown', { active: showSelectionDropdown })}>
            {!isUserUnder18 &&
              paymentProfiles
                .filter(
                  paymentProfile =>
                    paymentProfile.providerPayload !== selectedPaymentProfile.providerPayload
                )
                .map(paymentProfile => renderDropdownSelectionButton(paymentProfile))}
            <button
              type='button'
              className='dropdown-selection-button'
              onClick={() => {
                closeDropdown();
                trackerClient.sendEvent(
                  ManageEventType.UPDATE_PAYMENT_METHOD_ADD_CARD_CLICKED,
                  subscription
                );
                setShowStripeAddCardForm(true);
              }}>
              <div className='text-emphasis payment-method-container '>
                {translate('Heading.NewCreditOrDebitCard')}
              </div>
            </button>
          </div>
        </div>
        {!showStripeAddCardForm && (
          <Fragment>
            <div className='font-caption-header text-emphasis'>{translate('Label.Expiration')}</div>
            <input
              type='string'
              name='expiration'
              placeholder='MM/YY'
              className={`expiry-input ${expirationError ? 'error-input' : ''}`}
              value={expiration}
              inputMode='numeric'
              onChange={e => {
                let input = e.target.value;

                // Deletion
                if (expiration.startsWith(input)) {
                  setExpiration(input);
                  return;
                }

                if (expiration.length >= 2 && input.startsWith('1/')) {
                  input = `0${input}`;
                }

                // // Remove any non-numeric characters
                input = input.replace(/\D/g, '');

                if (input.length > 4) {
                  input = input.slice(0, 4);
                }

                if (input.length === 1 && input !== '0' && input !== '1') {
                  // months 2-9 are prefixed with 0
                  input = `0${input}/`;
                } else if (input.length === 2 && Number(input) > 12) {
                  input = `0${input.slice(0, 1)}/${input.slice(1)}`;
                } else if (input.length >= 2 && input.length <= 4) {
                  input = `${input.slice(0, 2)}/${input.slice(2)}`;
                }

                setExpiration(input);
              }}
            />
            {expirationError && (
              <div className='font-caption-body input-error-text'>
                {translate('Error.InvalidExpirationDate')}
              </div>
            )}
          </Fragment>
        )}
        {showStripeAddCardForm && (
          <StripeForm
            showEmail={false}
            showDisclosure={false}
            onFormStatusChange={(isSubmitAllowed: boolean) => setCanSubmit(isSubmitAllowed)}
          />
        )}
      </Modal.Body>
      <div className='footer-divider' />
      <Modal.Footer>
        <span
          className='font-caption-body'
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={updateDisclosure}
        />
        <div className='modal-buttons'>
          <Button
            variant={Button.variants.secondary}
            width={Button.widths.full}
            size={Button.sizes.large}
            className='action-button'
            onClick={closeModal}>
            {translate('Action.Cancel')}
          </Button>
          <Button
            width={Button.widths.full}
            size={Button.sizes.large}
            className='action-button'
            isLoading={loading}
            isDisabled={!canSubmit}
            onClick={async () => {
              if (!showStripeAddCardForm) {
                await updatePaymentProfile(selectedPaymentProfile.id, expiration);
              }

              if (showStripeAddCardForm) {
                await addAndUpdatePaymentProfile();
              }
            }}>
            {!loading && translate('Action.Save')}
            {loading && <span className='spinner spinner-sm' />}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdatePaymentProfileModal;
