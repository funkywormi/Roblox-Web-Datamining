// Illegal Content Report Form Component
import React, { useState, useEffect, ReactElement, ChangeEvent, useRef, useCallback } from 'react';
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
import { getStoredVerificationToken, setStoredVerificationToken } from './util/verificationTokenStorage';
import {
  isValidRobloxUrl,
  tooManyUrls,
  MAX_NUMBER_OF_CONTENTS,
  ReportType,
  reportTypeToString,
  isUrlValidForSubmission
} from './helpers';
import { SubmitRequestBody, SubmitModal } from './types';

import {
  Urls,
  Limit,
  IllegalTypeTranslationMap,
  IllegalContentSubCategoryKey,
  UKCHCROtherSubCategoryKey,
  ChildSexualExploitationSubCategoryKey,
  IPInfringementSubCategoryKey
} from './constants';
import { useTranslationKeyMap } from '../util/translation/translationKeyMap';
import { getIllegalTypeFilter } from '../util/filter';
import BackButton from './components/BackButton';

export interface Props {
  defaultContentURL?: string | null;
  reportType?: ReportType;
  onBack?: () => void;
}

const IllegalContentReportForm = ({
  defaultContentURL,
  reportType,
  onBack
}: Props): ReactElement => {
  const { data, error } = useGetMetadata();
  const { translate, translateHtml } = useTranslations();
  const { getTranslationKey } = useTranslationKeyMap(reportType);
  const otherIssueInputRef = useRef<HTMLInputElement | null>(null);
  const [issueType, setIssueType] = useState<string>('');
  const [otherIssue, setOtherIssue] = useState<string>('');
  const [urlStr, setUrlStr] = useState<string>(defaultContentURL || '');
  const [description, setDescription] = useState<string>('');
  // Country is only used for DSA forms (user selects from dropdown)
  // For non-DSA forms, backend sets the country based on report type
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [submittedModalInfo, setSubmittedModalInfo] = useState<SubmitModal | null>(null);
  const [needsVerificationFromBackend, setNeedsVerificationFromBackend] = useState<boolean>(false);

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
    setSelectedCountry('');
    setName(data?.name ?? '');
    setEmail('');
    setIsConfirmed(false);
  }, [data?.name]);

  useEffect(() => {
    if (mutation.isSuccess) {
      const data = mutation.data as { success?: boolean; message?: string; verificationToken?: string };
      if (data?.success === false && data?.message?.includes('Email Verification Required')) {
        setNeedsVerificationFromBackend(true);
        return;
      }
      if (data?.verificationToken) {
        setStoredVerificationToken(data.verificationToken);
      }
      const submitModal: SubmitModal = data?.success
        ? {
            title: translate(getTranslationKey('Title.Modal.ReportSuccess')),
            content: translate(getTranslationKey('Message.Modal.ReportSuccess')),
            buttonText: translate(getTranslationKey('Action.Modal.SubmitAnother'))
          }
        : {
            title: translate('Title.Modal.ReportFailure'),
            content: data?.message || 'Error',
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
    clearAllInputs,
    getTranslationKey
  ]);

  const ipInfringementTranslationHtml = translateHtml('Message.IpInfringement', [
    [
      'emailLink',
      'emailLinkEnd',
      text => (
        <a
          href={`${Urls.IP_INFRINGEMENT_AGENT_EMAIL}?subject=${encodeURIComponent(
            Urls.IP_INFRINGEMENT_AGENT_EMAIL_SUBJECT
          )}`}
          className='text-link'
          target='_blank'
          rel='noreferrer'>
          {text}
        </a>
      )
    ],
    [
      'docLink',
      'docLinkEnd',
      text => (
        <a
          href={Urls.IP_INFRINGEMENT_ROBLOX_USER_TERMS_OF_USE}
          className='text-link'
          target='_blank'
          rel='noreferrer'>
          {text}
        </a>
      )
    ]
  ]);

  const handleIpModalClose = () => {
    setIssueType('');
  };
  const handleSubmittedModalClose = () => {
    setSubmittedModalInfo(null);
  };
  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(event.target.value);
  };

  const buildRequestBody = useCallback(
    (opts?: { otpSessionToken?: string; includeVerificationToken?: boolean }): SubmitRequestBody => {
      const body: SubmitRequestBody = {
        IllegalType: issueType,
        OtherViolation: otherIssue,
        IllegalContentUrl: urlStr,
        Reason: description,
        Country: selectedCountry,
        Name: name,
        Email: email,
        IsAppeal: false,
        ReportType: reportTypeToString(reportType),
        OptOutCommunication: false
      };
      // optional fields for OTP and verification token
      if (opts?.otpSessionToken) {
        body.OtpSessionToken = opts.otpSessionToken;
      }
      if (opts?.includeVerificationToken !== false) {
        const stored = getStoredVerificationToken();
        if (stored) body.VerificationToken = stored;
      }
      return body;
    },
    [
      issueType,
      otherIssue,
      urlStr,
      description,
      selectedCountry,
      name,
      email,
      reportType
    ]
  );

  const submitReport = () => {
    mutation.mutate(buildRequestBody());
  };

  const handleOtpVerified = useCallback(
    (otpSessionToken: string) => {
      setNeedsVerificationFromBackend(false);
      mutation.mutate(
        buildRequestBody({
          otpSessionToken,
          includeVerificationToken: false
        })
      );
    },
    [buildRequestBody, mutation]
  );
  const onRadioClick = (event: React.FormEvent<HTMLInputElement>): void => {
    const { target } = event;
    if (target) {
      const selectedIssue = (target as HTMLButtonElement).getAttribute('data-value')!;
      if (
        selectedIssue === IllegalContentSubCategoryKey ||
        selectedIssue === UKCHCROtherSubCategoryKey
      ) {
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


  // AU OSA allows submission without a URL; other report types still require one.
  const isUrlRequired = reportType !== ReportType.AU_OSA;
  const canSubmit =
    !!issueType &&
    isUrlValidForSubmission(urlStr, isUrlRequired) &&
    !!description &&
    // Country is only required for DSA forms (other forms set country on backend)
    (reportType !== ReportType.DSA || !!selectedCountry) &&
    ((issueType !== IllegalContentSubCategoryKey && issueType !== UKCHCROtherSubCategoryKey) ||
      !!otherIssue) &&
    // CSE allows anonymous submission (empty email); a provided email must still be a
    // valid format so the verification modal can open. Other categories require name + email.
    (issueType === ChildSexualExploitationSubCategoryKey
      ? !email.trim() || EmailValidator.validate(email)
      : !!name && EmailValidator.validate(email)) &&
    // AU_OSA doesn't require confirmation checkbox
    (reportType === ReportType.AU_OSA || isConfirmed);

  const getTypeList = (): string[] => {
    if (reportType === ReportType.CHCR) {
      return (data?.chcrIllegalTypeList!) || [];
    }
    if (reportType === ReportType.AU_OSA) {
      return (data?.auOSAIllegalTypeList!) || [];
    }
    return (data?.illegalTypeList!) || [];
  };

  const sortIllegalTypeList = (rawIllegalTypeList: string[]): void => {
    if (!rawIllegalTypeList?.length) {
      return;
    }

    // Determine which "Other" option to move to the end based on report type
    const otherOptionKey =
      reportType === ReportType.CHCR ? UKCHCROtherSubCategoryKey : IllegalContentSubCategoryKey;

    const index = rawIllegalTypeList.indexOf(otherOptionKey);
    if (index > -1) {
      rawIllegalTypeList.splice(index, 1);
      rawIllegalTypeList.push(otherOptionKey);
    }
  };

  const typeList = getTypeList();
  sortIllegalTypeList(typeList);

  // Check if this is a user who should see the back button (UK or AU users)
  const shouldShowBackButton =
    reportType === ReportType.OSA ||
    reportType === ReportType.CHCR ||
    reportType === ReportType.OSA_COMPLAINT ||
    reportType === ReportType.AU_OSA;

  return (
    <div className='form-container'>
      {onBack && shouldShowBackButton && (
        <BackButton
          onClick={onBack}
          label={translate('Action.Back')}
          title={translate('Action.Back')}
        />
      )}

      <div id='title' className='section'>
        <h1>{translate(getTranslationKey('Title'))}</h1>
      </div>
      <div className='main-card'>
        <h2>{translate(getTranslationKey('Title.Content'))}</h2>
        <div id='dsa-description' className='section dsa-description'>
          <p>{translate(getTranslationKey('Message.DsaDescription1'))}</p>
          <p>{translate(getTranslationKey('Message.DsaDescription2'))}</p>
          <p>{translate(getTranslationKey('Message.DsaDescription3'))}</p>
          <p>{translate(getTranslationKey('Message.DsaDescription4'))}</p>
        </div>
        <div id='issue-type-selection' className='section'>
          <h5>{translate(getTranslationKey('Question.WhyIllegal'))}</h5>
          <div className='custom-radio-group'>
            {typeList?.filter(getIllegalTypeFilter(reportType)).map(illegalType => {
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
              if (
                illegalType === IllegalContentSubCategoryKey ||
                illegalType === UKCHCROtherSubCategoryKey
              ) {
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
          labelKey={getTranslationKey('Question.Url')}
          className='section'
        />
        <FormField
          id='illegal-description-input'
          label={translate(getTranslationKey('Question.Title'))}
          value={description}
          onUpdate={setDescription}
          maxLength={Limit.MAX_DESCRIPTION_LENGTH}
          rows={6}
        />
        {
          reportType === ReportType.DSA && (
              <div id='country-selection' className='section form-group visible-container'>
                <h5>{translate('Question.Country')}</h5>
                <div className='rbx-select-group'>
                  <select
                    value={selectedCountry}
                    className='input-field rbx-select'
                    onChange={handleCountryChange}>
                    <option value=''>{translate('Label.Country.DEFAULT')}</option>
                    {data?.countryList?.map(country => (
                      <option key={country} value={country}>
                        {translate(`Label.Country.${country}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )
        }
        <ContactFields
          name={name}
          email={email}
          onNameChange={setName}
          onEmailChange={setEmail}
          openOtpModal={needsVerificationFromBackend}
          optional={issueType === ChildSexualExploitationSubCategoryKey}
          onOtpVerified={handleOtpVerified}
          onOtpModalClosedWithoutVerify={() => setNeedsVerificationFromBackend(false)}
        />
        {/* Hide confirmation checkbox for AU_OSA */}
        {reportType !== ReportType.AU_OSA && (
          <Checkbox
            id='confirmCheckbox'
            checked={isConfirmed}
            onChange={setIsConfirmed}
            label={translate(getTranslationKey('Message.Confirm'))}
            className='section'
          />
        )}
        <div id='submit-button' className='section' style={{ marginTop: '40px' }}>
          {mutation.isLoading ? (
            <button type='button' className='btn-primary-md btn-full-width loading-button' disabled>
              <span className='loading-spinner' />
            </button>
          ) : (
            <button
              type='button'
              className='btn-primary-md btn-full-width'
              disabled={!canSubmit || needsVerificationFromBackend}
              onClick={submitReport}>
              <span>{translate('Action.Submit')}</span>
            </button>
          )}
        </div>
        <PrivacyNotice />
      </div>
      <CustomModal
        open={issueType === IPInfringementSubCategoryKey}
        onClose={handleIpModalClose}
        title={translate('Title.Modal.Ip')}
        content={ipInfringementTranslationHtml}
      />
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

export default IllegalContentReportForm;
