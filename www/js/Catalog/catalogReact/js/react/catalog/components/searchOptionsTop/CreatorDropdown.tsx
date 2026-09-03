import React, { useMemo } from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { AXAnalyticsService } from 'Roblox';
import CatalogFilter, { TFilterOption } from './filterDropdown/CatalogFilter';
import { Creator } from '../../constants/types';
import translationConfig from '../../translation.config';

export type CreatorDropdownProps = {
  creators: Creator[];
  selectedCreatorName: string | null | undefined;
  selectedCreator?: Creator | null;
  creatorNameInputValue: string;
  setCreatorNameInputValue: (newValue: string) => void;
  onCreatorChanged: (creator: Creator) => void;
  applyCreatorNameToQuery: (newCreatorName?: string | null) => void;
  customText: number | 'custom';
  defaultCreator?: Creator;
};

const CREATOR_INPUT_KEY = 'creator';

function CreatorDropdown({
  creators,
  selectedCreator,
  selectedCreatorName,
  creatorNameInputValue,
  setCreatorNameInputValue,
  onCreatorChanged,
  applyCreatorNameToQuery,
  customText,
  translate,
  intl,
  defaultCreator
}: CreatorDropdownProps & WithTranslationsProps): JSX.Element | null {
  const filters: TFilterOption<number | 'custom'>[] = useMemo(() => {
    return creators.map(creator => {
      const filterOption: TFilterOption<number | 'custom'> = {
        optionId: creator.userId,
        optionDisplayName: creator.name || '',
        optionValue: creator.userId
      };
      if (creator.userId === customText) {
        filterOption.textFields = [
          {
            key: CREATOR_INPUT_KEY,
            label: translate('Label.CreatorName'),
            initialValue: creatorNameInputValue
          }
        ];
      }
      return filterOption;
    });
  }, [creators, customText, creatorNameInputValue, translate]);

  if (!defaultCreator) {
    const itemName = `CreatorDropdown_NoDefault`;
    const log = JSON.stringify({
      message: 'Unable to render CreatorDropdown because defaultCreator was not found!'
    });
    // Report the error
    // We need to specify container name as counters name so we can build the graphs on grafana
    AXAnalyticsService.reportAXError({ itemName, counterName: 'CreatorDropdownError', log });
    return null;
  }

  return (
    <CatalogFilter<Creator['userId']>
      filter={{
        filterDropdownName: translate('Label.Filter.Creator'),
        filterDisplayName:
          selectedCreator?.userId === customText
            ? translate('Label.ByCreator', {
                creator: selectedCreatorName
              })
            : selectedCreator?.name || '',
        filterOptions: filters,
        selectedOptionId: selectedCreator ? selectedCreator.userId : defaultCreator.userId,
        defaultOptionId: defaultCreator.userId
      }}
      updateFilterValue={(newOptionValue, textValues) => {
        const newValue = textValues?.[CREATOR_INPUT_KEY] as string;
        const newSelectedCreatorId = newOptionValue?.optionId;
        const isCustom = newSelectedCreatorId === customText;
        const creator = creators.find(c => c.userId === newSelectedCreatorId);
        if (isCustom) {
          onCreatorChanged({ userId: customText, name: '' } as Creator);
        } else if (creator) {
          onCreatorChanged(creator);
        }
        applyCreatorNameToQuery(newValue);
        setCreatorNameInputValue(newValue || '');
      }}
      translate={translate}
      intl={intl}
    />
  );
}

export default withTranslations(CreatorDropdown, translationConfig);
