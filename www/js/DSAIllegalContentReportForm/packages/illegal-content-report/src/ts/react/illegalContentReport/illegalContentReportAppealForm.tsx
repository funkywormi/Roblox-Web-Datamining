import React, { useState, ReactElement, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Tooltip } from 'react-tooltip';
import { useTranslations } from '../util/translation';
import { Limit } from './constants';
import { SubmitModal, SubmitRequestBody } from './types';
import { sendReport } from './services';
import CustomModal from '../components/CustomModal';
import { ReportType } from './helpers';
import { useTranslationKeyMap } from '../util/translation/translationKeyMap';

export interface Props {
  defaultCaseID?: string | null;
  reportType?: ReportType;
}

const IllegalContentReportAppealForm = ({ defaultCaseID, reportType }: Props): ReactElement => {
  const { translate } = useTranslations();
  const { getTranslationKey } = useTranslationKeyMap(reportType);
  const [caseID, setCaseID] = useState<string>(defaultCaseID || '');
  const [description, setDescription] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [submittedModalInfo, setSubmittedModalInfo] = useState<SubmitModal | null>(null);

  const descriptionLimit = `(${translate('Message.DescriptionLimit', {
    number: Limit.MAX_DESCRIPTION_LENGTH.toString()
  })})`;

  const handleConfirmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsConfirmed(event.target.checked);
  };

  const mutation = useMutation(sendReport);

  const clearAllInputs = () => {
    setCaseID('');
    setDescription('');
    setIsConfirmed(false);
  };

  const handleSubmittedModalClose = () => {
    setSubmittedModalInfo(null);
  };

  useEffect(() => {
    if (mutation.data) {
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
    } else if (mutation.error) {
      const errorMessage =
        (mutation.error as { message: string })?.message || translate('Message.Modal.Error');
      const submitModal: SubmitModal = {
        title: translate('Title.Modal.ReportFailure'),
        content: errorMessage,
        buttonText: translate('Action.Modal.Ok')
      };
      setSubmittedModalInfo(submitModal);
    }
  }, [mutation.error, translate, mutation.data]);

  const submitReport = () => {
    const requestBody: SubmitRequestBody = {
      CaseId: caseID,
      Reason: description,
      IsAppeal: true
    };
    mutation.mutate(requestBody);
  };
  const canSubmit = isConfirmed && caseID;

  return (
    <div className='form-container'>
      <div id='title' className='section'>
        <h1>{translate('Title.Appeal')}</h1>
      </div>
      <div className='main-card'>
        <h2>{translate('Title.AppealContent')}</h2>
        {/* The description contains a hyperlink. This is why we need to embed it as an HTML. */}
        {/* eslint-disable-next-line react/no-danger */}
        <p
          dangerouslySetInnerHTML={{
            __html: translate(getTranslationKey('Message.AppealDescription1'))
          }}
        />
        <div id='url-input' className='section'>
          <h5>
            <span>{translate('Question.CaseId')}</span>
            <i
              data-tooltip-id='caseID-tooltip'
              data-tooltip-content={translate('Tooltip.CaseId')}
              data-tooltip-place='right'>
              <span className='icon-moreinfo' />
            </i>
            <Tooltip id='caseID-tooltip' className='status-tooltip-styles' />
          </h5>
          <input
            type='text'
            data-testid='caseID-input'
            className='form-control input-field'
            value={caseID}
            maxLength={Limit.MAX_URL_LENGTH}
            onChange={e => setCaseID(e.target.value)}
          />
        </div>

        <div id='illegal-description-input' className='section'>
          <h5>{translate('Question.AppealReason')}</h5>
          <p className='dsa-reason-limit'>{descriptionLimit}</p>
          <textarea
            data-testid='reason-input'
            className='ticket-message form-control input-field nonresizable'
            value={description}
            rows={6}
            maxLength={Limit.MAX_DESCRIPTION_LENGTH}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div id='final-confirm-checkbox' className='section'>
          <input
            type='checkbox'
            data-testid='confirm-btn'
            id='confirmCheckbox'
            className='pointer-cursor'
            checked={isConfirmed}
            onChange={handleConfirmChange}
          />
          <label htmlFor='confirmCheckbox' className='pointer-cursor margin-left-5'>
            {translate('Message.Confirm')}
          </label>
        </div>

        <div id='submit-button' className='section'>
          {mutation.isLoading ? (
            <button type='button' className='btn-primary-md btn-full-width loading-button' disabled>
              <span className='loading-spinner' />
            </button>
          ) : (
            <button
              type='button'
              data-testid='submit-btn'
              className='btn-primary-md btn-full-width'
              disabled={!canSubmit}
              onClick={submitReport}>
              <span>{translate('Action.Submit')}</span>
            </button>
          )}
        </div>
      </div>
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

export default IllegalContentReportAppealForm;
