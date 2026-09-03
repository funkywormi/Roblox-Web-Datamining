/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React from 'react';
import { TranslateFunction } from 'react-utilities';
import { IModalService, TSystemFeedbackService } from 'react-style-guide';
import { fireEvent } from 'roblox-event-tracker';
import { deleteSavedPaymentProfile } from './paymentMethodsSettingService';
import { COUNTER_METRICS, errorCodeMapping, TApiError } from '../constants/constants';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import createRemoveSavedItemModal from './createRemoveSavedItemModal';

type TRemovePaymentMethodModalProps = {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
  cannotDeletePaymentMethodModalService: IModalService;
  onDeleteSuccess: () => void;
  paymentProfileId: string;
};

export function createRemovePaymentMethodModal(): [
  ({
    translate,
    systemFeedbackService,
    cannotDeletePaymentMethodModalService,
    onDeleteSuccess,
    paymentProfileId
  }: TRemovePaymentMethodModalProps) => JSX.Element,
  IModalService
] {
  const [RemoveSavedItemModal, modalService] = createRemoveSavedItemModal();

  function RemovePaymentMethodModal({
    translate,
    systemFeedbackService,
    cannotDeletePaymentMethodModalService,
    onDeleteSuccess,
    paymentProfileId
  }: TRemovePaymentMethodModalProps) {
    const deletePaymentMethodHeader = translate(TRANSLATION_KEYS.DeletePaymentMethodHeading);
    const cancelText = translate(TRANSLATION_KEYS.AreYouSureDeletePaymentMethodDesc);

    const onDelete = async () => {
      fireEvent(COUNTER_METRICS.SAVED_PAYMENT_METHODS.IN_MODAL_CARD_DELETION);
      try {
        fireEvent(COUNTER_METRICS.API.DELETE_SAVED_PAYMENT_PROFILE_CALLED);
        const response = await deleteSavedPaymentProfile(paymentProfileId);
        if (response.status === 200) {
          fireEvent(COUNTER_METRICS.API.DELETE_SAVED_PAYMENT_PROFILE_SUCCEEDED);
          systemFeedbackService.success(translate(TRANSLATION_KEYS.DeletePaymentMethodSuccessDesc));
          onDeleteSuccess();
        }
      } catch (e) {
        const error = e as TApiError;
        if (
          error?.status === 412 &&
          error?.data === errorCodeMapping.RemovePaymentProfileNotAllowedFailure
        ) {
          fireEvent(COUNTER_METRICS.SUBSCRIPTIONS.SUBSCRIPTION_ATTACHED_TO_CARD);
          cannotDeletePaymentMethodModalService.open();
        } else {
          fireEvent(COUNTER_METRICS.API.DELETE_SAVED_PAYMENT_PROFILE_FAILED);
          systemFeedbackService.warning(
            translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse)
          );
        }
      }
    };

    return (
      <RemoveSavedItemModal
        translate={translate}
        header={deletePaymentMethodHeader}
        cancelText={cancelText}
        onDelete={onDelete}
        onNeutral={() => {
          fireEvent(COUNTER_METRICS.SAVED_PAYMENT_METHODS.IN_MODAL_ABORT_CARD_DELETION);
        }}
      />
    );
  }

  return [RemovePaymentMethodModal, modalService];
}

export default createRemovePaymentMethodModal;
