import React, { useState } from 'react';
import { Dropdown } from '@rbx/core-ui/legacy/react-style-guide';
import { useTranslations } from '../util/translation';

/**
 * The two PRD paths on the NCII removal request form: the affected user reporting
 * directly, versus an authorized representative acting on their behalf
 */
export enum USNCIIReportOption {
  AFFECTED_USER = 'affected-user',
  AUTHORIZED_REP = 'authorized-rep'
}

export interface USNCIISelectorProps {
  onSelectionChange: (option: USNCIIReportOption) => void;
}

interface ReportOptionItem {
  value: USNCIIReportOption;
  label: string;
}

const USNCIISelector: React.FC<USNCIISelectorProps> = ({ onSelectionChange }) => {
  const [selectedOption, setSelectedOption] = useState<ReportOptionItem | null>(null);
  const { translate } = useTranslations();

  const reportOptions: ReportOptionItem[] = [
    {
      value: USNCIIReportOption.AFFECTED_USER,
      label: translate('Label.USNCIISelector.AffectedUser')
    },
    {
      value: USNCIIReportOption.AUTHORIZED_REP,
      label: translate('Label.USNCIISelector.AuthorizedRep')
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
    return translate('Message.USNCIISelector.Description');
  };

  return (
    <div className='form-container'>
      <div className='section'>
        <h1>{translate('Title.USNCIISelector')}</h1>
      </div>

      <div className='main-card'>
        <div className='section'>
          <p>{translate('Message.USNCIISelector.Description')}</p>
        </div>

        <div className='rbx-select-group'>
          <Dropdown
            id='us-ncii-report-selector'
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

export default USNCIISelector;
