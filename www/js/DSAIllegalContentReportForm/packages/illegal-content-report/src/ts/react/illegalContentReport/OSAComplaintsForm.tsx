import React, { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as EmailValidator from 'email-validator';
import { Dropdown } from "@rbx/core-ui/legacy/react-style-guide";
import { useTranslations } from '../util/translation';
import { Urls } from './constants';
import { OSAComplaintType, SubmitRequestBody, SubmitModal } from './types';
import { sendReport } from './services';
import {
  isValidRobloxUrl,
  tooManyUrls,
  MAX_NUMBER_OF_CONTENTS,
  ReportType,
  reportTypeToString,
  isUrlValidForOSASubmission
} from './helpers';

import FormField from './components/FormField';
import ContactFields from './components/ContactFields';
import Checkbox from './components/Checkbox';
import PrivacyNotice from './components/PrivacyNotice';
import BackButton from './components/BackButton';
import UrlInput from './components/UrlInput';
import CustomModal from '../components/CustomModal';

const getRequiredLabel = (key: string) => `${key}*`;

export interface OSAComplaintsFormProps {
  complaintType: string;
  onBack?: () => void;
}

const OSAComplaintsForm: React.FC<OSAComplaintsFormProps> = ({ complaintType, onBack }) => {
  const { translate, translateHtml } = useTranslations();
  const asterisk = '*';
  const [urlStr, setUrlStr] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ukConfirmation, setUkConfirmation] = useState(false);
  const [optOutCommunications, setOptOutCommunications] = useState(false);
  const [submittedModalInfo, setSubmittedModalInfo] = useState<SubmitModal | null>(null);

  // Dynamic fields based on complaint type
  const [formData, setFormData] = useState<Record<string, string>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation(sendReport);

  const updateFormData = useCallback((key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Gets error message for URL field display.
   * Returns undefined if URL is empty (no error shown for empty state),
   * if complaint type doesn't require URL, or if URL is valid.
   * Only returns error message for invalid URLs when URL is required.
   * Used for real-time error display in UrlInput component.
   */
  const getUrlError = useCallback((): string | undefined => {
    if (complaintType !== OSAComplaintType.ILLEGAL_CONTENT_TAKEDOWN || !urlStr.trim())
      return undefined;

    if (!isValidRobloxUrl(urlStr)) {
      return translate('Message.UrlError');
    }
    if (tooManyUrls(urlStr)) {
      return translate('Message.TooManyUrlError', {
        number: MAX_NUMBER_OF_CONTENTS.toString()
      });
    }
    return undefined;
  }, [complaintType, urlStr, translate]);

  const clearAllInputs = useCallback(() => {
    setName('');
    setEmail('');
    setUrlStr('');
    setUkConfirmation(false);
    setOptOutCommunications(false);
    setFormData({});
    setErrors({});
  }, []);

  const getExplanationLabel = (typeOfConcern: string): string => {
    if (typeOfConcern === 'Application') {
      return translate('Label.OSAComplaints.ExplanationApplication');
    }
    return translate('Label.OSAComplaints.ExplanationContentClarity');
  };

  const getRequiredFields = (): string[] => {
    switch (complaintType as OSAComplaintType) {
      case OSAComplaintType.ILLEGAL_CONTENT_TAKEDOWN:
        return ['initialReportDateAndMethod', 'resurfaceDescription'];
      case OSAComplaintType.TERMS_OF_SERVICE:
        return ['typeOfConcern', 'quotedToSProvisions', 'explanationOfIssue'];
      case OSAComplaintType.CHCR_SUBCATEGORY:
        return ['safetyDutyBreached', 'factualDescription', 'breachExplanation'];
      case OSAComplaintType.CONTENT_REPORTING:
        return ['systemProcessElement', 'osaDutyBreachExplanation'];
      case OSAComplaintType.FREEDOM_OF_EXPRESSION_AND_PRIVACY:
        return ['concernType', 'impactedPolicyOrFeature', 'lackOfRegardExplanation'];
      case OSAComplaintType.PROACTIVE_TECHNOLOGY:
        return [
          'restrictedContentDescription',
          'proactiveTechnologyDescription',
          'tosProvisions',
          'tosBreachExplanation'
        ];
      default:
        return [];
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = translate('Error.NameRequired');
    }

    if (!email.trim()) {
      newErrors.email = translate('Error.EmailRequired');
    } else if (!EmailValidator.validate(email)) {
      newErrors.email = translate('Error.EmailInvalid');
    }

    // Validate specific fields based on complaint type
    const requiredFields = getRequiredFields();
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = translate('Error.FieldRequired');
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canSubmit = (): boolean => {
    const requiredFields = getRequiredFields();
    const hasRequiredFields = requiredFields.every(
      field => formData[field]?.trim()
    );
    const hasValidEmail = !!email.trim() && EmailValidator.validate(email);
    const hasName = !!name.trim();
    return (
      hasRequiredFields &&
      hasValidEmail &&
      hasName &&
      ukConfirmation &&
      isUrlValidForOSASubmission(urlStr, complaintType)
    );
  };

  // Effect to handle mutation results
  useEffect(() => {
    if (mutation.isSuccess) {
      const isProactiveTech = complaintType === OSAComplaintType.PROACTIVE_TECHNOLOGY;

      let modalContent: string | React.ReactNode;
      if (isProactiveTech) {
        // Use translateHtml for proactive tech to embed the terms of service link
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const proactiveTechMessage = translateHtml('Message.Modal.OSAProactiveTechSuccess', [
          [
            'docLink',
            'docLinkEnd',
            text => (
              <a
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                href={Urls.ROBLOX_TERMS_OF_SERVICE}
                className='text-link'
                target='_blank'
                rel='noreferrer'>
                {text}
              </a>
            )
          ]
        ]);
        modalContent = (
          <React.Fragment>
            {translate('Message.Modal.OSAComplaintSuccess')}
            <br /> <br />
            {proactiveTechMessage}
          </React.Fragment>
        );
      } else {
        modalContent = translate('Message.Modal.OSAComplaintSuccess');
      }

      const submitModal: SubmitModal = mutation.data?.success
        ? {
            title: translate('Title.Modal.ComplaintSuccess'),
            content: modalContent,
            buttonText: translate('Action.Modal.SubmitAnotherComplaint')
          }
        : {
            title: translate('Title.Modal.ComplaintFailure'),
            content: mutation?.data?.message || 'Error',
            buttonText: translate('Action.Modal.Ok')
          };

      setSubmittedModalInfo(submitModal);
      clearAllInputs();
    } else if (mutation.isError) {
      const errorMessage =
        (mutation.error as { message: string })?.message || translate('Message.Modal.Error');
      const submitModal: SubmitModal = {
        title: translate('Title.Modal.ComplaintFailure'),
        content: errorMessage,
        buttonText: translate('Action.Modal.Ok')
      };
      setSubmittedModalInfo(submitModal);
    }
  }, [
    mutation.isSuccess,
    mutation.error,
    mutation.isError,
    mutation.data,
    translate,
    translateHtml,
    complaintType,
    clearAllInputs
  ]);

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const requestBody: SubmitRequestBody = {
      IllegalType: complaintType,
      Name: name,
      Email: email,
      Country: 'UnitedKingdom',
      IsAppeal: false,
      ReportType: reportTypeToString(ReportType.OSA_COMPLAINT),
      OptOutCommunication: optOutCommunications,
      Custom: formData
    };

    if (complaintType === OSAComplaintType.ILLEGAL_CONTENT_TAKEDOWN) {
      requestBody.IllegalContentUrl = urlStr;
    }

    mutation.mutate(requestBody);
  };

  const handleModalClose = () => {
    setSubmittedModalInfo(null);
  };

  const renderSpecificFields = () => {
    switch (complaintType as OSAComplaintType) {
      case OSAComplaintType.ILLEGAL_CONTENT_TAKEDOWN:
        return (
          <React.Fragment>
            <UrlInput
              value={urlStr}
              onChange={setUrlStr}
              labelKey='Label.OSAComplaints.ContentLink'
              addStar
              testId='takedown-content-link'
              error={getUrlError()}
            />

            <FormField
              id='takedown-date-and-method'
              label={
                <React.Fragment>
                  {translate('Label.OSAComplaints.DateAndMethod')}
                  {asterisk}
                  <br />
                  <i className='dsa-reason-limit'>
                    {translate('Label.OSAComplaints.DateAndMethodTip')}
                  </i>
                </React.Fragment>
              }
              value={formData.initialReportDateAndMethod || ''}
              onUpdate={value => updateFormData('initialReportDateAndMethod', value)}
              error={errors.initialReportDateAndMethod}
            />

            <FormField
              id='takedown-resurface-description'
              label={translate('Label.OSAComplaints.ResurfaceDescription')}
              value={formData.resurfaceDescription || ''}
              onUpdate={value => updateFormData('resurfaceDescription', value)}
              showRequiredStar
              error={errors.resurfaceDescription}
            />
          </React.Fragment>
        );

      case OSAComplaintType.TERMS_OF_SERVICE:
        return (
          <React.Fragment>
            <div id='tos-concern-type'>
              <h5>{getRequiredLabel(translate('Label.OSAComplaints.ConcernType'))}</h5>
              <div className='rbx-select-group'>
                <Dropdown
                  id='typeOfConcern'
                  className='input-group-btn'
                  currSelectionLabel={
                    formData.typeOfConcern
                      ? translate(`Label.OSAComplaints.${formData.typeOfConcern}`)
                      : translate('Label.UKSelector.SelectReportType')
                  }>
                  {['Content', 'Clarity', 'Application'].map(option => (
                    <Dropdown.Item
                      key={option}
                      onSelect={() => updateFormData('typeOfConcern', option)}
                      active={formData.typeOfConcern === option}>
                      {translate(`Label.OSAComplaints.${option}`)}
                    </Dropdown.Item>
                  ))}
                </Dropdown>
              </div>
              {errors.typeOfConcern && (
                <span className='text-error field-validation-error'>{errors.typeOfConcern}</span>
              )}
            </div>

            <FormField
              id='tos-provisions'
              label={translate('Label.OSAComplaints.TosProvisions')}
              value={formData.quotedToSProvisions || ''}
              onUpdate={value => updateFormData('quotedToSProvisions', value)}
              showRequiredStar
              error={errors.quotedToSProvisions}
            />

            <FormField
              id='tos-explanation-od-issue'
              label={getExplanationLabel(formData.typeOfConcern!)}
              value={formData.explanationOfIssue || ''}
              onUpdate={value => updateFormData('explanationOfIssue', value)}
              showRequiredStar
              error={errors.explanationOfIssue}
            />
          </React.Fragment>
        );

      case OSAComplaintType.CHCR_SUBCATEGORY:
        return (
          <React.Fragment>
            <FormField
              id='safety-duty-breach'
              label={translate('Label.OSAComplaints.SafetyDutyBreach')}
              value={formData.safetyDutyBreached || ''}
              onUpdate={value => updateFormData('safetyDutyBreached', value)}
              showRequiredStar
              error={errors.safetyDutyBreached}
              className=''
            />

            <FormField
              id='experience-description'
              label={translate('Label.OSAComplaints.FactualDescription')}
              value={formData.factualDescription || ''}
              onUpdate={value => updateFormData('factualDescription', value)}
              showRequiredStar
              error={errors.factualDescription}
            />

            <FormField
              id='safety-breach-explanation'
              label={translate('Label.OSAComplaints.BreachExplanation')}
              value={formData.breachExplanation || ''}
              onUpdate={value => updateFormData('breachExplanation', value)}
              showRequiredStar
              error={errors.breachExplanation}
            />
          </React.Fragment>
        );

      case OSAComplaintType.CONTENT_REPORTING:
        return (
          <React.Fragment>
            <FormField
              id='content-system-concern'
              label={translate('Label.OSAComplaints.SystemConcern')}
              value={formData.systemProcessElement || ''}
              onUpdate={value => updateFormData('systemProcessElement', value)}
              maxLength={1000}
              showRequiredStar
              error={errors.systemProcessElement}
              className=''
            />

            <FormField
              id='content-breach-explanation'
              label={translate('Label.OSAComplaints.OsaDutyBreachExplanation')}
              value={formData.osaDutyBreachExplanation || ''}
              onUpdate={value => updateFormData('osaDutyBreachExplanation', value)}
              maxLength={1000}
              showRequiredStar
              error={errors.osaDutyBreachExplanation}
            />
          </React.Fragment>
        );

      case OSAComplaintType.FREEDOM_OF_EXPRESSION_AND_PRIVACY:
        return (
          <React.Fragment>
            <div id='freedom-concern-relates-to'>
              <h5>{getRequiredLabel(translate('Label.OSAComplaints.ConcernRelatesTo'))}</h5>
              <div className='rbx-select-group'>
                <Dropdown
                  id='concernType'
                  className='input-group-btn'
                  currSelectionLabel={
                    formData.concernType
                      ? translate(`Label.OSAComplaints.${formData.concernType}`)
                      : translate('Label.OSAComplaints.SelectConcernType')
                  }>
                  {['FreedomOfExpression', 'Privacy', 'Both'].map(option => (
                    <Dropdown.Item
                      key={option}
                      onSelect={() => updateFormData('concernType', option)}
                      active={formData.concernType === option}>
                      {translate(`Label.OSAComplaints.${option}`)}
                    </Dropdown.Item>
                  ))}
                </Dropdown>
              </div>
              {errors.concernType && (
                <span className='text-error field-validation-error'>{errors.concernType}</span>
              )}
            </div>

            <FormField
              id='freedom-policy-feature'
              label={translate('Label.OSAComplaints.ImpactedPolicyOrFeature')}
              value={formData.impactedPolicyOrFeature || ''}
              onUpdate={value => updateFormData('impactedPolicyOrFeature', value)}
              showRequiredStar
              error={errors.impactedPolicyOrFeature}
            />

            <FormField
              id='freedom-regard-explanation'
              label={translate('Label.OSAComplaints.LackOfRegardExplanation')}
              value={formData.lackOfRegardExplanation || ''}
              onUpdate={value => updateFormData('lackOfRegardExplanation', value)}
              showRequiredStar
              error={errors.lackOfRegardExplanation}
            />
          </React.Fragment>
        );

      case OSAComplaintType.PROACTIVE_TECHNOLOGY:
        return (
          <React.Fragment>
            <FormField
              id='proactive-content-description'
              label={
                translate('Label.OSAComplaints.RestrictedContentDescription') ||
                translate('Label.OSAComplaints.SelectRestrictedContentDescription')
              }
              value={formData.restrictedContentDescription || ''}
              onUpdate={value => updateFormData('restrictedContentDescription', value)}
              showRequiredStar
              error={errors.restrictedContentDescription}
              className=''
            />

            <FormField
              id='proactive-technology-description'
              label={translate('Label.OSAComplaints.ProactiveTechnologyDescription')}
              value={formData.proactiveTechnologyDescription || ''}
              onUpdate={value => updateFormData('proactiveTechnologyDescription', value)}
              showRequiredStar
              error={errors.proactiveTechnologyDescription}
            />

            <FormField
              id='proactive-tos-provisions'
              label={translate('Label.OSAComplaints.ProactiveTosProvisions')}
              value={formData.tosProvisions || ''}
              onUpdate={value => updateFormData('tosProvisions', value)}
              showRequiredStar
              error={errors.tosProvisions}
            />

            <FormField
              id='proactive-breach-explanation'
              label={translate('Label.OSAComplaints.TosBreachExplanation')}
              value={formData.tosBreachExplanation || ''}
              onUpdate={value => updateFormData('tosBreachExplanation', value)}
              showRequiredStar
              error={errors.tosBreachExplanation}
            />
          </React.Fragment>
        );

      default:
        return null;
    }
  };

  const getFormTitle = (): string => {
    switch (complaintType as OSAComplaintType) {
      case OSAComplaintType.ILLEGAL_CONTENT_TAKEDOWN:
        return translate('Title.OSAComplaints.IllegalContentTakedown');
      case OSAComplaintType.TERMS_OF_SERVICE:
        return translate('Title.OSAComplaints.TermsOfService');
      case OSAComplaintType.CHCR_SUBCATEGORY:
        return translate('Title.OSAComplaints.CHCRSubcategory');
      case OSAComplaintType.CONTENT_REPORTING:
        return translate('Title.OSAComplaints.ContentReporting');
      case OSAComplaintType.FREEDOM_OF_EXPRESSION_AND_PRIVACY:
        return translate('Title.OSAComplaints.FreedomOfExpressionAndPrivacy');
      case OSAComplaintType.PROACTIVE_TECHNOLOGY:
        return translate('Title.OSAComplaints.ProactiveTechnology');
      default:
        return translate('Title.OSAComplaints.Default');
    }
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
        <h1>{getFormTitle()}</h1>
      </div>

      <div className='main-card'>
        {/* Dynamic fields based on complaint type */}
        {renderSpecificFields()}

        <ContactFields
          name={name}
          email={email}
          onNameChange={setName}
          onEmailChange={setEmail}
        />

        <Checkbox
          id='uk-confirmation'
          checked={ukConfirmation}
          onChange={setUkConfirmation}
          label={translate('Message.OSA.Confirm')}
          className='section'
        />

        <div className='section'>
          <p>{translate('Message.OSAComplaints.OptOutDescription')}</p>
          <Checkbox
            id='osa-opt-out'
            checked={optOutCommunications}
            onChange={setOptOutCommunications}
            label={translate('Message.OSAComplaints.OptOut')}
          />
        </div>

        {/* Submit Button */}
        <div className='section'>
          {mutation.isLoading ? (
            <button type='button' className='btn-primary-md btn-full-width loading-button' disabled>
              <span className='loading-spinner' />
            </button>
          ) : (
            <button
              type='button'
              className='btn-cta-md btn-full-width'
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

export default OSAComplaintsForm;
