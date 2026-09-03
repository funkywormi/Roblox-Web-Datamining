import React, { useMemo, useState, useEffect } from 'react';
import { Button, IModalService, Modal } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { LegallySensitiveContentService } from 'Roblox';
import parentalRequestConstants from '../constants/parentalRequestConstants';
import legallySensitiveContentConstants from '../constants/legallySensitiveContentConstants';
import parentalRequestInlineErrorHandler, {
  ParentalRequestError,
  defaultParentalRequestError
} from '../utils/parentalRequestErrorHandler';
import RequestType from '../enums/RequestType';
import parentalRequestService from '../services/parentalRequestService';
import {
  sendParentEmailSubmitEvent,
  sendInteractParentEmailFormEvent,
  sendParentEmailModalShownEvent
} from '../services/eventService';
import ParentalRequestErrorReason from '../enums/ParentalRequestErrorReason';
import fetchFeatureCheckResponse from '../../../accessManagement/accessManagementAPI';
import AmpResponse from '../../../accessManagement/AmpResponse';
import { Access } from '../../../enums';

type ChildSubjectToPCFetchStatus = 'pending' | 'success' | 'failed';

const useParentEmailModal = (
  translate: TranslateFunction,
  consentType: RequestType,
  successCallBack: (sessionId: string, newParentEmail?: string, emailNotSent?: boolean) => void,
  onHidecallback: () => void,
  value?: Record<string, unknown> | null,
  source?: string
): [JSX.Element, IModalService] => {
  const { privacyPolicyUrl, emailRegex, translationKeys } = parentalRequestConstants;
  const { gatherParentEmail } = translationKeys;
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isChildSubjectToPC, setIsChildSubjectToPC] = useState<boolean>(false);
  const [
    childSubjectToPCFetchStatus,
    setChildSubjectToPCFetchStatus
  ] = useState<ChildSubjectToPCFetchStatus>('pending');
  const [sendEmailBtnLoadingStatus, setSendEmailBtnLoadingStatus] = useState<boolean>(false);
  const [parentEmailInput, setParentEmailInput] = useState<string>('');
  const modalService: IModalService = useMemo(
    () => ({
      open: () => setModalOpen(true),
      close: () => setModalOpen(false)
    }),
    []
  );

  const [errorTranslationKey, setErrorTranslationKey] = useState('');
  const fetchIsChildSubjectToPC = async () => {
    try {
      const response = (await fetchFeatureCheckResponse(
        parentalRequestConstants.isChildSubjectToPCFeatureName
      )) as AmpResponse;
      setIsChildSubjectToPC(response.access === Access.Granted);
      setChildSubjectToPCFetchStatus('success');
    } catch {
      setChildSubjectToPCFetchStatus('failed');
    }
  };
  useEffect(() => {
    sendParentEmailModalShownEvent({
      requestType: consentType,
      details: value,
      extraState: source
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchIsChildSubjectToPC();
  }, []);

  const consentName = useMemo(() => {
    if (childSubjectToPCFetchStatus !== 'success') {
      return legallySensitiveContentConstants.vpcRequestDefaultConsentName;
    }
    return isChildSubjectToPC
      ? legallySensitiveContentConstants.vpcRequestLinkSubjectToPCConsentName
      : legallySensitiveContentConstants.vpcRequestLinkNotSubjectToPCConsentName;
  }, [isChildSubjectToPC, childSubjectToPCFetchStatus]);

  const [
    vpcLegallySensitiveData,
    vpcLegallySensitiveActions
  ] = LegallySensitiveContentService.useLegallySensitiveContentAndActions(
    consentName,
    legallySensitiveContentConstants.collectEmailModalSurfaceName
  );

  const legallySensitiveContent = vpcLegallySensitiveData?.wordsOfConsent ?? {};

  const description = useMemo(
    () => (
      <span
        dangerouslySetInnerHTML={{
          __html: legallySensitiveContent.description ?? ''
        }}
      />
    ),
    [legallySensitiveContent.description]
  );

  const regex = new RegExp(emailRegex);
  const getSetEmailErrorMessage = () => {
    if (parentEmailInput.length > 0 && !regex.test(parentEmailInput)) {
      return translate(gatherParentEmail.invalidEmailError);
    }

    if (errorTranslationKey) {
      return translate(errorTranslationKey);
    }
    return '';
  };

  const sendParentEmailAddress = async () => {
    setErrorTranslationKey('');
    try {
      const response = await parentalRequestService.sendRequestToNewParent({
        email: parentEmailInput,
        requestType: consentType,
        requestDetails: value,
        auditData: vpcLegallySensitiveActions.getBase64EncodedAuditHeader()
      });
      sendParentEmailSubmitEvent({
        requestType: consentType,
        sessionId: response.sessionId,
        details: value,
        extraState: source
      });
      setSendEmailBtnLoadingStatus(false);
      modalService.close();
      successCallBack(response.sessionId, parentEmailInput);
    } catch (err) {
      setParentEmailInput('');
      setSendEmailBtnLoadingStatus(false);
      const error = (err as ParentalRequestError) ?? defaultParentalRequestError;
      const errorReason = parentalRequestInlineErrorHandler(
        error.data.code as ParentalRequestErrorReason
      );
      if (errorReason === ParentalRequestErrorReason.SenderFloodedRequestCreated) {
        successCallBack(error.data.sessionId, undefined, true);
      }
      setErrorTranslationKey(errorReason);
    }
  };

  const modalBody = (
    <React.Fragment>
      <div className='parental-consent-modal-body'>{description}</div>
      <form className='form-horizontal' autoComplete='off'>
        <div id='parent-email-container' className='form-group'>
          <label htmlFor='parent-email-address' className='form-control-label'>
            {legallySensitiveContent.textboxLabel}
          </label>
          <input
            id='parent-email-address'
            type='email'
            className='form-control input-field'
            placeholder={legallySensitiveContent.placeholderText}
            autoComplete='off'
            value={parentEmailInput}
            onChange={e => {
              setParentEmailInput(e.target.value);
              setErrorTranslationKey('');
            }}
            onFocus={() =>
              sendInteractParentEmailFormEvent({
                requestType: consentType,
                details: value,
                extraState: source
              })
            }
          />
        </div>
        {/* <!-- Do not remove the two input hidden fields below. They are to prevent browsers from saving the email as your username in the autofill settings https://stackoverflow.com/questions/15738259/disabling-chrome-autofill --> */}
        <input type='text' className='hidden' name='fake-username' />
        <input
          type='password'
          className='hidden'
          name='fake-password'
          autoComplete='new-password'
        />
        {/* <!-- Do not remove the two input hidden fields above. --> */}
      </form>
      <div className='form-group'>
        <p className='text-error form-control-label'>{getSetEmailErrorMessage()}</p>
      </div>
      <div
        className='text-footer access-management-upsell-inner-modal-text-footer'
        dangerouslySetInnerHTML={{
          __html: legallySensitiveContent.footer
        }}
      />
    </React.Fragment>
  );

  const emailModal = (
    <Modal
      show={modalOpen}
      onHide={() => {
        modalService.close();
        onHidecallback();
      }}
      backdrop
      className='access-management-upsell-inner-modal'
      size='sm'
      aria-labelledby='access-management-upsell-inner-modal-title'
      centered>
      <Modal.Header useBaseBootstrapComponent>
        <div className='access-management-upsell-inner-modal-title-container'>
          <Modal.Title id='access-management-upsell-inner-modal-title'>
            {legallySensitiveContent.title}
          </Modal.Title>
        </div>
        <button
          type='button'
          className='close close-button'
          onClick={() => {
            modalService.close();
            onHidecallback();
          }}>
          <span className='icon-close' />
        </button>
      </Modal.Header>
      <Modal.Body>{modalBody}</Modal.Body>
      <Modal.Footer>
        <Button
          variant={Button.variants.primary}
          size={Button.sizes.medium}
          width={Button.widths.full}
          isDisabled={parentEmailInput === '' || getSetEmailErrorMessage() !== ''}
          isLoading={sendEmailBtnLoadingStatus}
          onClick={async () => {
            setSendEmailBtnLoadingStatus(true);
            await sendParentEmailAddress();
          }}>
          {legallySensitiveContent.button}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return [emailModal, modalService];
};

export default useParentEmailModal;
