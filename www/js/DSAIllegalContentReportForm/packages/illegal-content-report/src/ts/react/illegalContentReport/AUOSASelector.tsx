import React, { useState } from 'react';
import { Dropdown } from "@rbx/core-ui/legacy/react-style-guide";
import { useTranslations } from '../util/translation';

export enum AUOSAReportOption {
  HARMFUL_ILLEGAL_CONTENT = 'harmful-illegal-content',
  NON_COMPLIANCE = 'non-compliance'
}

export interface AUOSASelectorProps {
  onSelectionChange: (option: AUOSAReportOption) => void;
}

interface ReportOptionItem {
  value: AUOSAReportOption;
  label: string;
}

const AUOSASelector: React.FC<AUOSASelectorProps> = ({ onSelectionChange }) => {
  const [selectedOption, setSelectedOption] = useState<ReportOptionItem | null>(null);
  const { translate } = useTranslations();

  const reportOptions: ReportOptionItem[] = [
    {
      value: AUOSAReportOption.HARMFUL_ILLEGAL_CONTENT,
      label: translate('Title.AUOSA.Content')
    },
    {
      value: AUOSAReportOption.NON_COMPLIANCE,
      label: translate('Title.AUOSANONCOMPLIANCE.Content')
    }
  ];

  const handleOptionSelect = (option: ReportOptionItem) => {
    setSelectedOption(option);
    onSelectionChange(option.value);
  };

  const getDisplayLabel = (): string => {
    if (selectedOption) {
      return selectedOption.label;
    }
    return translate('Label.AUOSASelector.PleaseSelect');
  };

  return (
    <div className='form-container'>
      <div className='section'>
        <h1>{translate('Title.AUOSASelector')}</h1>
        <p>{translate('Message.AUOSASelector.Description')}</p>
      </div>

      <div className='main-card'>
        <h5>{translate('Label.AUOSASelector.SelectReportType')}</h5>
        <div className='rbx-select-group'>
          <Dropdown
            id='auosa-report-selector'
            className='input-group-btn'
            currSelectionLabel={getDisplayLabel()}>
            {reportOptions.map(option => (
              <Dropdown.Item
                key={option.value}
                onSelect={() => handleOptionSelect(option)}
                active={selectedOption?.value === option.value}>
                {option.label}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default AUOSASelector;

