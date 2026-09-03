import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as EmailValidator from 'email-validator';
import { useTranslations } from '../util/translation';
import { sendReport } from './services';
import { ReportType, reportTypeToString } from './helpers';
import { SubmitRequestBody, SubmitModal } from './types';
import useGetMetadata from './useGetMetadata';
import { IllegalTypeTranslationMap, AUOSANonComplianceOtherKey, Limit } from './constants';

import FormField from './components/FormField';
import ContactFields from './components/ContactFields';
import PrivacyNotice from './components/PrivacyNotice';
import BackButton from './components/BackButton';
import CustomModal from '../components/CustomModal';

export interface AUOSANonComplianceFormProps {
  onBack?: () => void;
}

const AUOSANonComplianceForm: React.FC<AUOSANonComplianceFormProps> = ({ onBack }) => {
  const { translate } = useTranslations();
  const { data, error } = useGetMetadata();
  const otherConcernAreaInputRef = useRef<HTMLInputElement | null>(null);
  
  // Form state
  const [description, setDescription] = useState('');
  const [concernArea, setConcernArea] = useState('');
  const [otherConcernArea, setOtherConcernArea] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submittedModalInfo, setSubmittedModalInfo] = useState<SubmitModal | null>(null);

  const mutation = useMutation(sendReport);

  // Initialize name from metadata
  useEffect(() => {
    setName(data?.name ?? '');
  }, [data?.name]);

  // Handle metadata error
  useEffect(() => {
    if (error) {
      const errorMessage =
        (error as { message: string })?.message || translate('Message.Modal.Error');
      const errorModal: SubmitModal = {
        title: translate('Title.Modal.MetadataError'),
        content: errorMessage,
        buttonText: translate('Action.Modal.Ok')
      };
      setSubmittedModalInfo(errorModal);
    }
  }, [error, translate]);

  const clearAllInputs = useCallback(() => {
    setDescription('');
    setConcernArea('');
    setOtherConcernArea('');
    setName('');
    setEmail('');
  }, []);

  useEffect(() => {
    if (mutation.isSuccess) {
      const submitModal: SubmitModal = mutation.data?.success
        ? {
            title: translate('Title.Modal.ReportSuccess'),
            content: translate('Message.Modal.AUOSANonComplianceSuccess'),
            buttonText: translate('Action.Modal.SubmitAnother')
          }
        : {
            title: translate('Title.Modal.ReportFailure'),
            content: mutation?.data?.message || 'Error',
            buttonText: translate('Action.Modal.Ok')
          };

      setSubmittedModalInfo(submitModal);
      clearAllInputs();
    } else if (mutation.isError) {
      const errorMessage =
        (mutation.error as { message: string })?.message || translate('Message.Modal.Error');
      const submitModal: SubmitModal = {
        title: translate('Title.Modal.ReportFailure'),
        content: errorMessage,
        buttonText: translate('Action.Modal.Ok')
      };
      setSubmittedModalInfo(submitModal);
    }
  }, [mutation.isSuccess, mutation.error, mutation.isError, mutation.data, translate, clearAllInputs]);

  // Get concern area list from metadata
  const concernAreaList: string[] = data?.auOSANonComplianceIllegalTypeList ?? [];

  const onRadioClick = (event: React.FormEvent<HTMLInputElement>): void => {
    const { target } = event;
    if (target) {
      const selectedConcernArea = (target as HTMLButtonElement).getAttribute('data-value')!;
      if (selectedConcernArea === AUOSANonComplianceOtherKey) {
        otherConcernAreaInputRef?.current?.focus();
      } else {
        setOtherConcernArea('');
      }
      setConcernArea(selectedConcernArea);
    }
  };

  // Form validation
  const canSubmit = (): boolean => {
    return (
      !!description.trim() &&
      !!concernArea &&
      (concernArea !== AUOSANonComplianceOtherKey || !!otherConcernArea.trim()) &&
      !!name.trim() &&
      !!email.trim() &&
      EmailValidator.validate(email)
    );
  };

  const handleSubmit = () => {
    // Country is not sent for non-DSA forms - backend sets it based on report type
    const requestBody: SubmitRequestBody = {
      Name: name,
      Email: email,
      IsAppeal: false,
      ReportType: reportTypeToString(ReportType.AU_OSA_NON_COMPLIANCE),
      OptOutCommunication: false,
      Reason: description,
      IllegalType: concernArea,
      OtherViolation: otherConcernArea
    };

    mutation.mutate(requestBody);
  };

  const handleModalClose = () => {
    setSubmittedModalInfo(null);
  };

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
        <h1>{translate('Title.AUOSANonCompliance')}</h1>
      </div>

      <div className='main-card'>
        <div id='auosa-non-compliance-description' className='section dsa-description'>
          <p>{translate('Message.AUOSANonCompliance.Description1')}</p>
          <p>{translate('Message.AUOSANonCompliance.Description2')}</p>
          <p>{translate('Message.AUOSANonCompliance.Description3')}</p>
        </div>

        {/* Field 1: Concern area selection */}
        <div id='concern-area-selection'>
          <h5>{translate('Label.AUOSANonCompliance.ConcernArea')}*</h5>
          <div className='custom-radio-group'>
            {concernAreaList.map(concernType => {
              const id = `${concernType}-radio`;
              const mapKey = concernType as keyof typeof IllegalTypeTranslationMap;
              const radioElement = (
                <div key={id} className='radio-item'>
                  <input
                    id={id}
                    type='radio'
                    name='concern_area'
                    onChange={onRadioClick}
                    data-value={concernType}
                    checked={concernArea === concernType}
                  />
                  <label htmlFor={id}>
                    <span>
                      {translate(`Label.AUOSANonCompliance.${IllegalTypeTranslationMap[mapKey]}`)}
                    </span>
                  </label>
                </div>
              );
              if (concernType === AUOSANonComplianceOtherKey) {
                return (
                  <div key='other-radio' className='other-radio-container'>
                    {radioElement}
                    <input
                      ref={otherConcernAreaInputRef}
                      type='text'
                      value={otherConcernArea}
                      maxLength={Limit.MAX_DESCRIPTION_LENGTH}
                      className='input-field other-violation-input'
                      onChange={e => setOtherConcernArea(e.target.value)}
                    />
                  </div>
                );
              }
              return radioElement;
            })}
          </div>
        </div>

        {/* Field 2: Description */}
        <FormField
          id='description'
          label={translate('Label.AUOSANonCompliance.Description')}
          value={description}
          onUpdate={setDescription}
          maxLength={1000}
          rows={6}
          showRequiredStar
        />

        {/* Fields 3.1 & 3.2: Name and Email */}
        <ContactFields
          name={name}
          email={email}
          onNameChange={setName}
          onEmailChange={setEmail}
        />

        {/* Submit Button */}
        <div id='submit-button' className='section'>
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

export default AUOSANonComplianceForm;

