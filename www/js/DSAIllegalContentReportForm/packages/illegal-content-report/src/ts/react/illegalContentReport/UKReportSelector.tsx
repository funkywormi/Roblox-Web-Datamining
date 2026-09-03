import React, { useState } from 'react';
import { Dropdown } from "@rbx/core-ui/legacy/react-style-guide";
import { useTranslations } from '../util/translation';

export enum UKReportOption {
  ILLEGAL_CONTENT = 'illegal-content',
  HARMFUL_TO_CHILDREN = 'harmful-to-children',
  OSA_COMPLAINTS = 'osa-complaints'
}

export interface UKReportSelectorProps {
  onSelectionChange: (option: UKReportOption) => void;
}

interface ReportOptionItem {
  value: UKReportOption;
  label: string;
}

const UKReportSelector: React.FC<UKReportSelectorProps> = ({ onSelectionChange }) => {
  const [selectedOption, setSelectedOption] = useState<ReportOptionItem | null>(null);
  const { translate } = useTranslations();

  const reportOptions: ReportOptionItem[] = [
    {
      value: UKReportOption.ILLEGAL_CONTENT,
      label: translate('Label.UKSelector.IllegalContent')
    },
    {
      value: UKReportOption.HARMFUL_TO_CHILDREN,
      label: translate('Label.UKSelector.HarmfulToChildren')
    },
    {
      value: UKReportOption.OSA_COMPLAINTS,
      label: translate('Label.UKSelector.OSAComplaints')
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
    return translate('Label.UKSelector.PleaseSelect');
  };

  return (
    <div className='form-container'>
      <div className='section'>
        <h1>{translate('Title.UKSelector')}</h1>
        <p>{translate('Message.UKSelector.Description')}</p>
      </div>

      <div className='main-card'>
        <h5>{translate('Label.UKSelector.SelectReportType')}</h5>
        <div className='rbx-select-group'>
          <Dropdown
            id='uk-report-selector'
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

export default UKReportSelector;
