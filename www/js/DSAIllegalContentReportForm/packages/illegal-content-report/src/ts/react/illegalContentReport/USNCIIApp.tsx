import React, { useState, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@rbx/core-scripts/react';
import { TranslationProvider } from '../util/translation';
import USNCIISelector, { USNCIIReportOption } from './USNCIISelector';
import USNCIIForm from './USNCIIForm';
import { dsaTranslationConfig } from '../../../translation.config';
import '../style/shared.scss';
import './style.scss';

interface USNCIIFlowProps {
  selectedOption: USNCIIReportOption | null;
  onOptionSelection: (option: USNCIIReportOption) => void;
  onBack: () => void;
}

/**
 * Two-step NCII flow: first pick affected-user vs authorized-rep, then render the
 * form with the appropriate attestation copy and `IsAuthorizedRep` flag.
 */
const USNCIIFlow = ({
  selectedOption,
  onOptionSelection,
  onBack
}: USNCIIFlowProps): React.ReactElement => {
  if (!selectedOption) {
    return <USNCIISelector onSelectionChange={onOptionSelection} />;
  }
  const isAuthorizedRep = selectedOption === USNCIIReportOption.AUTHORIZED_REP;
  return <USNCIIForm isAuthorizedRep={isAuthorizedRep} onBack={onBack} />;
};

/**
 * Entry-point app for the US NCII Removal Request form (Take It Down Act).
 * Mounted by the Roblox Web entry bundle onto `#united-states-ncii-illegal-content-report-container`.
 */
const USNCIIApp = (): React.ReactElement => {
  const [selectedOption, setSelectedOption] = useState<USNCIIReportOption | null>(null);

  const handleOptionSelection = (option: USNCIIReportOption) => {
    setSelectedOption(option);
  };

  const onBack = useCallback(() => {
    setSelectedOption(null);
  }, []);

  return (
    <TranslationProvider translationConfig={dsaTranslationConfig}>
      <QueryClientProvider client={queryClient}>
        <div id='generic-challenge-container' />
        <USNCIIFlow
          selectedOption={selectedOption}
          onOptionSelection={handleOptionSelection}
          onBack={onBack}
        />
      </QueryClientProvider>
    </TranslationProvider>
  );
};

export default USNCIIApp;
