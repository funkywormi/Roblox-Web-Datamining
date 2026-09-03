import React, { useState } from 'react';
import { Dropdown } from "@rbx/core-ui/legacy/react-style-guide";
import { useTranslations } from '../util/translation';
import { OSAComplaintType } from './types';
import useGetMetadata from './useGetMetadata';
import BackButton from './components/BackButton';

export interface OSAComplaintsSelectorProps {
  onSelectionChange: (complaintType: string) => void;
  onBack?: () => void;
}

interface ComplaintOptionItem {
  value: string;
  label: string;
}

const OSAComplaintsSelector: React.FC<OSAComplaintsSelectorProps> = ({
  onSelectionChange,
  onBack
}) => {
  const [selectedOption, setSelectedOption] = useState<ComplaintOptionItem | null>(null);
  const { translate } = useTranslations();
  const { data } = useGetMetadata();

  const complaintOptions: ComplaintOptionItem[] =
    (data?.osaSpecificComplaintsIllegalTypeList!)
      ?.filter(type => Object.values(OSAComplaintType).includes(type as OSAComplaintType))
      ?.map((complaintType: string) => ({
        value: complaintType,
        label: translate(`Label.OSAComplaints.${complaintType}`)
      })) || [];

  const handleOptionSelect = (option: ComplaintOptionItem) => {
    setSelectedOption(option);
    onSelectionChange(option.value);
  };

  const getDisplayLabel = (): string => {
    if (selectedOption) {
      return selectedOption.label;
    }
    return translate('Label.OSAComplaints.PleaseSelect');
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
        <h1>{translate('Title.OSAComplaints')}</h1>
        <p>{translate('Message.OSAComplaints.Description')}</p>
      </div>

      <div className='main-card'>
        <h5>{translate('Label.OSAComplaints.SelectComplaintType')}</h5>
        <div className='rbx-select-group'>
          <Dropdown
            id='osa-complaints-selector'
            className='input-group-btn'
            currSelectionLabel={getDisplayLabel()}>
            {complaintOptions.map(option => (
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

export default OSAComplaintsSelector;
