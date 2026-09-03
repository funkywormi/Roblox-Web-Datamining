import React, { useState, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@rbx/core-scripts/react';
import { TranslationProvider } from '../util/translation';
import IllegalContentReportForm from './IllegalContentReportForm';
import IllegalContentReportAppealForm from './illegalContentReportAppealForm';
import AUOSASelector, { AUOSAReportOption } from './AUOSASelector';
import AUOSANonComplianceForm from './AUOSANonComplianceForm';
import { dsaTranslationConfig } from '../../../translation.config';
import '../style/shared.scss';
import './style.scss';
import { ReportType } from './helpers';

interface AUOSAFlowProps {
  selectedOption: AUOSAReportOption | null;
  contentURLParam: string | null;
  onOptionSelection: (option: AUOSAReportOption) => void;
  onBack: () => void;
}

/**
 * Handles the multi-step flow for AU OSA users.
 * Renders the appropriate component based on the current selection state.
 */
const AUOSAFlow = ({
  selectedOption,
  contentURLParam,
  onOptionSelection,
  onBack
}: AUOSAFlowProps): React.ReactElement => {
  if (!selectedOption) {
    // Step 1: Show AU OSA selector
    return <AUOSASelector onSelectionChange={onOptionSelection} />;
  }

  // Step 2: Show selected form based on AU OSA option
  switch (selectedOption) {
    case AUOSAReportOption.HARMFUL_ILLEGAL_CONTENT:
      return (
        <IllegalContentReportForm
          reportType={ReportType.AU_OSA}
          defaultContentURL={contentURLParam}
          onBack={onBack}
        />
      );
    case AUOSAReportOption.NON_COMPLIANCE:
      return <AUOSANonComplianceForm onBack={onBack} />;
    default:
      return <AUOSASelector onSelectionChange={onOptionSelection} />;
  }
};

/**
 * Application component for Australia users' illegal content reporting.
 * Provides two options:
 * 1. Report harmful or illegal content
 * 2. Report non-compliance with Australian Online Safety Act
 *
 * Also handles appeals when `appeal=true` query parameter is present.
 */
const AUOSAApp = (): React.ReactElement => {
  const queryParams = new URLSearchParams(window.location.search);
  const appealParam = queryParams.get('appeal');
  const caseIDParam = queryParams.get('caseID');
  const contentURLParam = queryParams.get('contentURL');

  const [selectedOption, setSelectedOption] = useState<AUOSAReportOption | null>(null);

  const handleOptionSelection = (option: AUOSAReportOption) => {
    setSelectedOption(option);
  };

  const onBack = useCallback(() => {
    setSelectedOption(null);
  }, []);

  // Handle appeals first (before showing the AU OSA flow)
  if (appealParam && appealParam === 'true') {
    return (
      <TranslationProvider translationConfig={dsaTranslationConfig}>
        <QueryClientProvider client={queryClient}>
          <div id='generic-challenge-container' />
          <IllegalContentReportAppealForm
            reportType={ReportType.AU_OSA}
            defaultCaseID={caseIDParam}
          />
        </QueryClientProvider>
      </TranslationProvider>
    );
  }

  return (
    <TranslationProvider translationConfig={dsaTranslationConfig}>
      <QueryClientProvider client={queryClient}>
        <div id='generic-challenge-container' />
        <AUOSAFlow
          selectedOption={selectedOption}
          contentURLParam={contentURLParam}
          onOptionSelection={handleOptionSelection}
          onBack={onBack}
        />
      </QueryClientProvider>
    </TranslationProvider>
  );
};

export default AUOSAApp;

