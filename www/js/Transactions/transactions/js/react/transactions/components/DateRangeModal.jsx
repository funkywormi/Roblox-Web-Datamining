import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, DatePicker, Modal } from 'react-style-guide';
import { dataStores } from 'core-roblox-utilities';
import { dateService } from 'core-utilities';
import { DEFAULT_LANGUAGE_ID, DEFAULT_EARLIEST_YEAR_DIFF } from '../../../../ts';
import { requestSalesReportDownload } from '../services/transactionsDataService';
import CompletedDownloadModal from './CompletedDownloadModal';
import { useEconomyMetadata } from '../hooks/useEconomyMetadata';

const { endOfToday } = dateService;
const { localeDataStore } = dataStores;
const REQUEST_IN_PROGRESS_CODE = 31;

function DateRangeModal({
  translate,
  systemFeedbackService,
  targetId,
  targetType,
  transactionType,
  show,
  onClose
}) {
  const [userLanguageCode, setUserLanguageCode] = useState(DEFAULT_LANGUAGE_ID);
  const [datePicker, setDatePicker] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [showCompletedDownloadModal, setShowCompletedDownloadModal] = useState(false);
  const [downloadDisabled, setDownloadDisabled] = useState(false);
  const { metadata } = useEconomyMetadata();

  const handleCalendarReady = (selectedDates, dateStr, instance) => {
    setDatePicker(instance);
  };

  const handleCalendarChanged = selectedDates => {
    if (selectedDates.length < 1) {
      return;
    }

    const start = new Date(
      Date.UTC(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), 1, 0, 0, 0, 0)
    );
    const end = new Date(
      Date.UTC(selectedDates[0].getFullYear(), selectedDates[0].getMonth() + 1, 0, 23, 59, 59, 999)
    );

    setDateRange([start, end]);
  };

  const handleSalesReportDownload = () => {
    // Disable download button to prevent spamming
    setDownloadDisabled(true);
    requestSalesReportDownload(targetId, targetType, dateRange, transactionType)
      .then(_ => {
        onClose();
        setShowCompletedDownloadModal(true);
      })
      .catch(errors => {
        onClose();
        if (errors?.length > 0 && errors[0].code === REQUEST_IN_PROGRESS_CODE) {
          systemFeedbackService.success(
            translate('Response.ReportGenerationInProgress') ||
              'Your request is being processed. You will be notified via email once your report is generated.'
          );
        } else if (errors?.length > 0 && errors[0]?.userFacingMessage) {
          systemFeedbackService.warning(errors[0].userFacingMessage);
        } else {
          systemFeedbackService.warning(translate('Message.UnknownError'));
        }
      })
      .finally(() => setDownloadDisabled(false));
  };

  const options = {
    mode: 'single',
    onReady: handleCalendarReady,
    onChange: handleCalendarChanged,
    locale: userLanguageCode,
    position: 'below',
    wrap: true,
    inline: true,
    minDate: new Date(
      new Date().getFullYear() -
        (metadata.transactionRecordsDownloadEarliestYearDiff ?? DEFAULT_EARLIEST_YEAR_DIFF),
      0,
      1
    ),
    maxDate: endOfToday()
  };

  useEffect(() => {
    if (datePicker) {
      const now = new Date();
      const initStart = new Date(now.getFullYear(), now.getMonth(), 1);
      initStart.setUTCHours(0, 0, 0);
      const initEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      initEnd.setUTCHours(23, 59, 999);
      setDateRange([initStart, initEnd]);
      datePicker.setDate(now, true);
    }
    // Note user must already be authenticated at this point
    localeDataStore.getUserLocale().then(response => {
      if (response.data?.ugc?.language?.languageCode) {
        setUserLanguageCode(response.data.ugc.language.languageCode);
      }
    });
  }, [datePicker]);

  return (
    <Fragment>
      <CompletedDownloadModal
        show={showCompletedDownloadModal}
        onClose={() => setShowCompletedDownloadModal(false)}
        translate={translate}
      />
      <Modal show={show} onHide={onClose} className='transactions-modal'>
        <Modal.Header title={translate('Description.DateRangeSelection')} onClose={onClose} />
        <Modal.Body>
          <p className='text'>
            {translate('Description.DownloadMonthInstructions') ||
              'Please select the month of the transactions you want to download.'}
          </p>
          <div className='transactions-date-picker-container'>
            <DatePicker
              options={options}
              languageCode={userLanguageCode}
              plugin={DatePicker.pluginType.MonthSelect}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSalesReportDownload} isDisabled={downloadDisabled}>
            {translate('Action.Download')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
}

DateRangeModal.propTypes = {
  translate: PropTypes.func.isRequired,
  systemFeedbackService: PropTypes.shape({
    success: PropTypes.func.isRequired,
    warning: PropTypes.func.isRequired
  }).isRequired,
  targetId: PropTypes.number.isRequired,
  targetType: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  transactionType: PropTypes.string.isRequired
};

export default DateRangeModal;
