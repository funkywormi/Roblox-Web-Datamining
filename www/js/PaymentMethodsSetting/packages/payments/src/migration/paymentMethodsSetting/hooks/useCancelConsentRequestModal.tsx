import { IModalService, TSystemFeedbackService } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import useSettingsModal from './useSettingsModal';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import { cancelPendingConsentRequest } from '../services/paymentMethodsSettingService';
import {
  sendCancelPendingRequestModalShownEvent,
  sendCancelRequestModalButtonClickEvent,
  sendDoNotCancelModalButtonClickEvent
} from '../services/eventService';

type TCancelConsentRequestModalProps = {
  systemFeedbackService: TSystemFeedbackService;
  translate: TranslateFunction;
  onSuccess: () => void;
  consentId?: number;
  state: string; // used for event tracking
};

const useCancelConsentRequestModal = ({
  systemFeedbackService,
  translate,
  onSuccess,
  consentId,
  state
}: TCancelConsentRequestModalProps): [JSX.Element, IModalService] => {
  const [cancelConsentRequestModal, cancelConsentRequestModalService] = useSettingsModal({
    translate,
    titleResourceId: TRANSLATION_KEYS.CancelRequestHeading,
    bodyResourceId: TRANSLATION_KEYS.CancelSettingUpdateRequestDescription,
    actionButtonTextResourceId: TRANSLATION_KEYS.YesAction,
    neutralButtonTextResourceId: TRANSLATION_KEYS.NoAction,
    size: 'sm',
    onAction: async () => {
      sendCancelRequestModalButtonClickEvent(state);
      if (consentId) {
        try {
          await cancelPendingConsentRequest(consentId);
          onSuccess();
          systemFeedbackService.success(translate(TRANSLATION_KEYS.GenericSuccessDialogMessage));
        } catch (error) {
          systemFeedbackService.warning(
            translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse)
          );
        }
      }
    },
    onNeutral: () => {
      sendDoNotCancelModalButtonClickEvent(state);
    }
  });

  const openModalService = () => {
    sendCancelPendingRequestModalShownEvent(state);
    cancelConsentRequestModalService.open();
  };

  return [
    cancelConsentRequestModal,
    { open: openModalService, close: cancelConsentRequestModalService.close }
  ];
};

export default useCancelConsentRequestModal;
