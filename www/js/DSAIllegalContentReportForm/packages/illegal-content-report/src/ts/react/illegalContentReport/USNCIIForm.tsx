import React, { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as EmailValidator from 'email-validator';
import { useTranslations } from '../util/translation';
import { sendReport } from './services';
import { ReportType, reportTypeToString, isUrlValidForSubmission } from './helpers';
import { SubmitRequestBody, SendReportResponse, SubmitModal } from './types';
import useGetMetadata from './useGetMetadata';
import { NCIIContentSubCategoryKey, USNCIILimits } from './constants';

import FormField from './components/FormField';
import ContactFields from './components/ContactFields';
import PrivacyNotice from './components/PrivacyNotice';
import BackButton from './components/BackButton';
import Checkbox from './components/Checkbox';
import UrlInput from './components/UrlInput';
import CustomModal from '../components/CustomModal';

/**
 * Props for the US NCII Removal Request form.
 *
 * `isAuthorizedRep` distinguishes PRD Path 1 (affected user) from Path 2
 * (authorized representative). It is passed to the backend via Custom so the
 * Toolbox ticket records which path was used. The rendered description copy
 * is shared across both paths.
 */
export interface USNCIIFormProps {
  isAuthorizedRep: boolean;
  onBack?: () => void;
}

/**
 * US Non-Consensual Intimate Imagery removal request form (Take It Down Act).
 *
 * Fields required by the PRD:
 *   - Content location (IllegalContentUrl)
 *   - Description of content (1000 char max)
 *   - Circumstances (optional, 1000 char max)
 *   - Good faith attestation (enforced client-side only, NOT sent to backend)
 *   - Electronic signature (typed legal name, sent in Custom with timestamp)
 *   - Reporter name and email
 *
 * Description and Circumstances are concatenated client-side into `Reason`
 * so the backend ViewModel stays unchanged. ElectronicSignature,
 * SignatureTimestamp (ISO8601 set at submit), and IsAuthorizedRep are passed
 * through `Custom` where support-web-subsite validates them and
 * safety-platform-processors propagates them to the Safety Platform ticket.
 */
const USNCIIForm: React.FC<USNCIIFormProps> = ({ isAuthorizedRep, onBack }) => {
  const { translate } = useTranslations();
  const { data, error } = useGetMetadata();

  const [contentLocation, setContentLocation] = useState('');
  const [description, setDescription] = useState('');
  const [circumstances, setCircumstances] = useState('');
  const [attestation, setAttestation] = useState(false);
  const [signature, setSignature] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submittedModalInfo, setSubmittedModalInfo] = useState<SubmitModal | null>(null);

  const clearAllInputs = useCallback(() => {
    setContentLocation('');
    setDescription('');
    setCircumstances('');
    setAttestation(false);
    setSignature('');
    setName('');
    setEmail('');
  }, []);

  const mutation = useMutation(sendReport, {
    onSuccess: (response: SendReportResponse) => {
      const submitModal: SubmitModal = response?.success
        ? {
            title: translate('Title.Modal.USNCIIReportSuccess'),
            content: (
              <React.Fragment>
                {translate('Message.Modal.USNCIIReportSuccess1')}
                <br />
                <br />
                {translate('Message.Modal.USNCIIReportSuccess2')}
              </React.Fragment>
            ),
            buttonText: translate('Action.Modal.SubmitAnother')
          }
        : {
            title: translate('Title.Modal.ReportFailure'),
            content: response?.message || 'Error',
            buttonText: translate('Action.Modal.Ok')
          };
      setSubmittedModalInfo(submitModal);
      clearAllInputs();
    },
    onError: (mutationError: unknown) => {
      const errorMessage =
        (mutationError as { message: string })?.message || translate('Message.Modal.Error');
      setSubmittedModalInfo({
        title: translate('Title.Modal.ReportFailure'),
        content: errorMessage,
        buttonText: translate('Action.Modal.Ok')
      });
    }
  });

  useEffect(() => {
    setName(data?.name ?? '');
  }, [data?.name]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { message: string })?.message || translate('Message.Modal.Error');
      setSubmittedModalInfo({
        title: translate('Title.Modal.MetadataError'),
        content: errorMessage,
        buttonText: translate('Action.Modal.Ok')
      });
    }
  }, [error, translate]);

  const canSubmit = (): boolean => {
    return (
      isUrlValidForSubmission(contentLocation.trim()) &&
      !!description.trim() &&
      description.length <= USNCIILimits.MAX_DESCRIPTION_LENGTH &&
      circumstances.length <= USNCIILimits.MAX_CIRCUMSTANCES_LENGTH &&
      attestation &&
      !!signature.trim() &&
      signature.length <= USNCIILimits.MAX_SIGNATURE_LENGTH &&
      !!name.trim() &&
      !!email.trim() &&
      EmailValidator.validate(email)
    );
  };

  const handleSubmit = () => {
    // Timestamp captured client-side at submit; backend validates ISO8601.
    const signatureTimestamp = new Date().toISOString();
    const trimmedCircumstances = circumstances.trim();
    const reasonCombined = trimmedCircumstances
      ? `${description}\n\nCircumstances: ${trimmedCircumstances}`
      : description;

    const requestBody: SubmitRequestBody = {
      Name: name,
      Email: email,
      IsAppeal: false,
      ReportType: reportTypeToString(ReportType.US_NCII),
      OptOutCommunication: false,
      IllegalType: NCIIContentSubCategoryKey,
      IllegalContentUrl: contentLocation,
      Reason: reasonCombined,
      Custom: {
        ElectronicSignature: signature,
        SignatureTimestamp: signatureTimestamp,
        IsAuthorizedRep: String(isAuthorizedRep)
      }
    };

    mutation.mutate(requestBody);
  };

  const handleModalClose = () => {
    setSubmittedModalInfo(null);
  };

  const attestationLabelKey = 'Label.USNCII.GoodFaithAttestation';

  return (
    <div className='form-container'>
      {onBack && (
        <BackButton
          onClick={onBack}
          label={translate('Action.Back')}
          title={translate('Action.Back')}
        />
      )}

      <div className='section'>
        <h1>{translate('Title.USNCII')}</h1>
      </div>

      <div className='main-card'>
        <div id='us-ncii-description' className='section dsa-description'>
          <p>{translate('Message.USNCII.Description1')}</p>
          <p>{translate('Message.USNCII.Description2')}</p>
          <p>{translate('Message.USNCII.Description3')}</p>
        </div>

        <UrlInput
          value={contentLocation}
          onChange={setContentLocation}
          labelKey='Label.USNCII.ContentLocation'
          addStar
          className='section'
        />

        <FormField
          id='ncii-description'
          label={translate('Label.USNCII.Description')}
          value={description}
          onUpdate={setDescription}
          maxLength={USNCIILimits.MAX_DESCRIPTION_LENGTH}
          rows={6}
          showRequiredStar
        />

        <FormField
          id='ncii-circumstances'
          label={
            <React.Fragment>
              {translate('Label.USNCII.Circumstances')}{' '}
              <span className='dsa-reason-limit' style={{ display: 'inline' }}>
                {translate('Label.Optional')}
              </span>
            </React.Fragment>
          }
          value={circumstances}
          onUpdate={setCircumstances}
          maxLength={USNCIILimits.MAX_CIRCUMSTANCES_LENGTH}
          rows={4}
        />

        <ContactFields
          name={name}
          email={email}
          onNameChange={setName}
          onEmailChange={setEmail}
        />

        <div id='ncii-signature' className='section'>
          <h5>{`${translate('Label.USNCII.ElectronicSignature')}*`}</h5>
          <input
            type='text'
            className='form-control input-field'
            value={signature}
            maxLength={USNCIILimits.MAX_SIGNATURE_LENGTH}
            onChange={e => setSignature(e.target.value)}
          />
        </div>

        <Checkbox
          id='ncii-good-faith'
          checked={attestation}
          onChange={setAttestation}
          label={translate(attestationLabelKey)}
          className='section'
          required
        />

        <div id='submit-button' className='section' style={{ marginTop: 48 }}>
          {mutation.isLoading ? (
            <button type='button' className='btn-primary-md btn-full-width loading-button' disabled>
              <span className='loading-spinner' />
            </button>
          ) : (
            <button
              type='button'
              className='btn-primary-md btn-full-width'
              disabled={!canSubmit()}
              onClick={handleSubmit}>
              {translate('Action.Submit')}
            </button>
          )}
        </div>

        <PrivacyNotice />
      </div>

      <CustomModal
        open={!!submittedModalInfo}
        onClose={handleModalClose}
        title={submittedModalInfo?.title}
        content={submittedModalInfo?.content}>
        <button type='button' className='btn-control-md btn-full-width' onClick={handleModalClose}>
          {submittedModalInfo?.buttonText}
        </button>
      </CustomModal>
    </div>
  );
};

export default USNCIIForm;
