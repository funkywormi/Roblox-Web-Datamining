import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { getRevenueSummary } from '../services/transactionsDataService';
import SummaryTable from '../components/SummaryTable';

function SummaryContainer({
  translate,
  systemFeedbackService,
  userId,
  transactionTypeOptions,
  usedTypes,
  timeFrame,
  onTransactionTypeSelect
}) {
  // States
  const [summaryData, setSummaryData] = useState([]);

  // Retrieve total amounts by category
  useEffect(() => {
    if (usedTypes === 0) {
      return;
    }

    //  Call endpoint for totals given a timeframe only if not stored
    getRevenueSummary(userId, usedTypes, timeFrame).then(
      response => {
        setSummaryData(response.data);
      },
      errors => {
        if (errors.length >= 0 && errors[0].code) {
          const errorCode = errors[0].code;
          systemFeedbackService.warning(`Error Code: ${errorCode}`);
        }
      }
    );
  }, [userId, usedTypes, timeFrame, systemFeedbackService]);

  return (
    <div className='summary'>
      <SummaryTable
        translate={translate}
        data={summaryData}
        transactionTypes={transactionTypeOptions}
        onTransactionTypeSelect={onTransactionTypeSelect}
      />
    </div>
  );
}

SummaryContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  systemFeedbackService: PropTypes.shape({
    warning: PropTypes.func.isRequired
  }).isRequired,
  userId: PropTypes.number.isRequired,
  transactionTypeOptions: PropTypes.shape({}).isRequired,
  usedTypes: PropTypes.number.isRequired,
  timeFrame: PropTypes.string.isRequired,
  onTransactionTypeSelect: PropTypes.func.isRequired
};

export default SummaryContainer;
