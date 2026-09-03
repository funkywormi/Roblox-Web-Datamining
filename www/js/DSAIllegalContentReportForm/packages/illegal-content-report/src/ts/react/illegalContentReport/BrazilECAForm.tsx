// Brazil ECA (Statute of the Child and Adolescent) Report Form Component
import React, { useState, useEffect, ReactElement, useRef, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as EmailValidator from 'email-validator';
import { useTranslations } from '../util/translation';
import CustomModal from '../components/CustomModal';
import ContactFields from './components/ContactFields';
import FormField from './components/FormField';
import PrivacyNotice from './components/PrivacyNotice';
import Checkbox from './components/Checkbox';
import UrlInput from './components/UrlInput';
import { sendReport } from './services';
import useGetMetadata from './useGetMetadata';
import {
  isValidRobloxUrl,
  tooManyUrls,
  MAX_NUMBER_OF_CONTENTS,
  ReportType,
  reportTypeToString,
  isUrlValidForSubmission,
  isRoleValidForBrazilECA
} from './helpers';
import { SubmitRequestBody, SubmitModal } from './types';

import {
  Limit,
  IllegalTypeTranslationMap,
  IllegalContentSubCategoryKey,
  BrazilECARoleOptions,
  BrazilECARoleOtherKey
} from './constants';
import { getIllegalTypeFilter } from '../util/filter';
import BackButton from './components/BackButton';

export interface Props {
  defaultContentURL?: string | null;
  onBack?: () => void;
}

const BRAZIL_COUNTRY_NAME = 'Brazil';

const BrazilECAForm = ({ defaultContentURL, onBack }: Props): ReactElement => {
  const reportType = ReportType.BR_ECA;
  const { data, error } = useGetMetadata();
  const { translate, translateHtml } = useTranslations();
  const otherIssueInputRef = useRef<HTMLInputElement | null>(null);
  const [issueType, setIssueType] = useState<string>('');
  const [otherIssue, setOtherIssue] = useState<string>('');
  const [urlStr, setUrlStr] = useState<string>(defaultContentURL || '');
  const [description, setDescription] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [submittedModalInfo, setSubmittedModalInfo] = useState<SubmitModal | null>(null);

  useEffect(() => {
    setName(data?.name ?? '');
  }, [data?.name]);

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

  const mutation = useMutation(sendReport);
  const clearAllInputs = useCallback(() => {
    setIssueType('');
    setOtherIssue('');
    setUrlStr('');
    setDescription('');
    setRole('');
    setName(data?.name ?? '');
    setEmail('');
    setIsConfirmed(false);
  }, [data?.name]);

  useEffect(() => {
    if (mutation.isSuccess) {
      const submitModal: SubmitModal = mutation.data?.success
        ? {
            title: translate('Title.Modal.ReportSuccess'),
            content: translate('Message.Modal.ReportSuccess'),
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
  }, [
    mutation.isSuccess,
    mutation.error,
    mutation.isError,
    translate,
    mutation.data,
    clearAllInputs
  ]);


  // Modal content for "Other" role selection - redirect to support
  const roleOtherTranslationHtml = (
    <React.Fragment>
      {translateHtml('Message.Modal.BrazilECA.RoleOther', [
        [
          'docLink',
          'docLinkEnd',
          text => (
            <a
              key='support-link'
              href='https://www.roblox.com/support'
              className='text-link'
              target='_blank'
              rel='noreferrer'>
              {text}
            </a>
          )
        ]
      ])}
    </React.Fragment>
  );


  const handleRoleOtherModalClose = () => {
    setRole('');
  };

  const handleSubmittedModalClose = () => {
    setSubmittedModalInfo(null);
  };

  const onRoleRadioClick = (event: React.FormEvent<HTMLInputElement>): void => {
    const { target } = event;
    if (target) {
      const selectedRole = (target as HTMLButtonElement).getAttribute('data-value');
      if (!selectedRole) {
        console.warn('selected role not found');
        return;
      }
      setRole(selectedRole);
    }
  };

  const submitReport = () => {
    const requestBody: SubmitRequestBody = {
      IllegalType: issueType,
      OtherViolation: otherIssue,
      IllegalContentUrl: urlStr,
      Reason: description,
      Country: BRAZIL_COUNTRY_NAME,
      Name: name,
      Email: email,
      IsAppeal: false,
      ReportType: reportTypeToString(reportType),
      OptOutCommunication: false,
      Custom: { Role: role }
    };
    mutation.mutate(requestBody);
  };

  const onRadioClick = (event: React.FormEvent<HTMLInputElement>): void => {
    const { target } = event;
    if (target) {
      const selectedIssue = (target as HTMLButtonElement).getAttribute('data-value')!;
      if (selectedIssue === IllegalContentSubCategoryKey) {
        otherIssueInputRef?.current?.focus();
      } else {
        setOtherIssue('');
      }
      setIssueType(selectedIssue);
    }
  };

  /**
   * Gets error message for URL field display.
   * Returns undefined if URL is empty (no error shown for empty state)
   * or if URL is valid. Only returns error message for invalid URLs.
   * Used for real-time error display in UrlInput component.
   */
  const getUrlError = useCallback((): string | undefined => {
    if (!urlStr) return undefined;
    if (!isValidRobloxUrl(urlStr)) {
      return translate('Message.UrlError');
    }
    if (tooManyUrls(urlStr)) {
      return translate('Message.TooManyUrlError', { number: MAX_NUMBER_OF_CONTENTS.toString() });
    }
    return undefined;
  }, [urlStr, translate]);

  // Check if role is valid (not empty and not "Other")
  const isRoleValid = isRoleValidForBrazilECA(role);

  // Check if form is valid for submission
  const canSubmit =
    !!issueType &&
    isUrlValidForSubmission(urlStr) &&
    !!description &&
    isRoleValid &&
    (issueType !== IllegalContentSubCategoryKey || !!otherIssue) &&
    !!name &&
    EmailValidator.validate(email) &&
    isConfirmed;

  // Use the Brazil ECA specific illegal type list
  const typeList = useMemo(() => data?.brECAIllegalTypeList ?? [], [data?.brECAIllegalTypeList]);

  // Role options for Brazil ECA form
  const roleOptions = Object.values(BrazilECARoleOptions);

  return (
    <div className='form-container'>
      {onBack && (
        <BackButton
          onClick={onBack}
          label={translate('Action.Back')}
          title={translate('Action.Back')}
        />
      )}

      <div id='title' className='section'>
        <h1>{translate('Title.BrazilECA')}</h1>
      </div>
      <div className='main-card'>
        <div id='dsa-description' className='section dsa-description'>
          <p>{translate('Message.BrazilECA.Description1')}</p>
          <p>{translate('Message.BrazilECA.Description2')}</p>
          <p>{translate('Message.BrazilECA.Description3')}</p>
        </div>
        <div id='issue-type-selection' className='section'>
          <h5>{translate('Question.BrazilECA.WhyIllegal')}*</h5>
          <div className='custom-radio-group'>
            {typeList.filter(getIllegalTypeFilter(reportType)).map(illegalType => {
              const id = `${illegalType}-radio`;
              const mapKey = illegalType as keyof typeof IllegalTypeTranslationMap;
              const radioElement = (
                <div key={id} className='radio-item'>
                  <input
                    id={id}
                    type='radio'
                    name='issue_type'
                    onChange={onRadioClick}
                    data-value={illegalType}
                    checked={issueType === illegalType}
                  />
                  <label htmlFor={id}>
                    <span>
                      {translate(`Label.IllegalType.${IllegalTypeTranslationMap[mapKey]}`)}
                    </span>
                  </label>
                </div>
              );
              if (illegalType === IllegalContentSubCategoryKey) {
                return (
                  <div key='other-radio' className='other-radio-container'>
                    {radioElement}
                    <input
                      ref={otherIssueInputRef}
                      type='text'
                      value={otherIssue}
                      maxLength={Limit.MAX_DESCRIPTION_LENGTH}
                      className='input-field other-violation-input'
                      onChange={e => setOtherIssue(e.target.value)}
                    />
                  </div>
                );
              }
              return radioElement;
            })}
          </div>
        </div>
        <UrlInput
          value={urlStr}
          onChange={setUrlStr}
          error={getUrlError()}
          labelKey='Question.Url'
          className='section'
        />
        <FormField
          id='illegal-description-input'
          label={translate('Question.BrazilECA.Title')}
          value={description}
          onUpdate={setDescription}
          maxLength={Limit.MAX_DESCRIPTION_LENGTH}
          rows={6}
          showRequiredStar
        />

        <ContactFields
          name={name}
          email={email}
          onNameChange={setName}
          onEmailChange={setEmail}
        />

        {/* Role Selection - Brazil ECA specific (under Contact Information) */}
        <div id='role-selection' className='section'>
          <h5>{translate('Question.BrazilECA.Role')}*</h5>
          <div className='custom-radio-group'>
            {roleOptions.map(roleOption => {
              const id = `role-${roleOption}-radio`;
              return (
                <div key={id} className='radio-item'>
                  <input
                    id={id}
                    type='radio'
                    name='role_type'
                    onChange={onRoleRadioClick}
                    data-value={roleOption}
                    checked={role === roleOption}
                  />
                  <label htmlFor={id}>
                    <span>{translate(`Label.BrazilECA.Role.${roleOption}`)}</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <Checkbox
          id='confirmCheckbox'
          checked={isConfirmed}
          onChange={setIsConfirmed}
          label={translate('Message.BrazilECA.Confirm')}
          className='section'
          required
        />
        <div id='submit-button' className='section' style={{ marginTop: '40px' }}>
          {mutation.isLoading ? (
            <button type='button' className='btn-primary-md btn-full-width loading-button' disabled>
              <span className='loading-spinner' />
            </button>
          ) : (
            <button
              type='button'
              className='btn-primary-md btn-full-width'
              disabled={!canSubmit}
              onClick={submitReport}>
              <span>{translate('Action.Submit')}</span>
            </button>
          )}
        </div>
        <PrivacyNotice />
      </div>


      {/* Modal for "Other" role selection - redirects to general support */}
      <CustomModal
        open={role === BrazilECARoleOtherKey}
        onClose={handleRoleOtherModalClose}
        title={translate('Title.Modal.BrazilECA.RoleOther')}
        content={roleOtherTranslationHtml}
      />

      {/* Modal for form submission result */}
      <CustomModal
        open={!!submittedModalInfo}
        onClose={handleSubmittedModalClose}
        title={submittedModalInfo?.title}
        content={submittedModalInfo?.content}>
        <button
          type='button'
          className='btn-control-md btn-full-width white-space-button'
          onClick={handleSubmittedModalClose}>
          {submittedModalInfo?.buttonText}
        </button>
      </CustomModal>
    </div>
  );
};

export default BrazilECAForm;

