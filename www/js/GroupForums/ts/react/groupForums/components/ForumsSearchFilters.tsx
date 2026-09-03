import React, { useCallback, useState } from 'react';
import {
  Button,
  RadioGroup,
  Radio,
  SheetRoot,
  SheetContent,
  SheetTitle,
  SheetBody,
  SheetActions
} from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import { useForumsSearchContext } from '../contexts/ForumsSearchContext';
import { ContentType, ForumsMode, TimeRange } from '../types/search';
import { CATEGORY_ALL } from '../utils/forumsSearchUrl';

export type ForumsSearchFiltersProps = {
  onClose: () => void;
};

/**
 * The filters sheet: content type, category scope and recency. Mounted only while open (see
 * ForumsSearch), so the useState initializers below are the seeding.
 */
const ForumsSearchFilters = ({ onClose }: ForumsSearchFiltersProps): JSX.Element => {
  const { translate } = useTranslation();
  const {
    contentType,
    timeRange,
    filterCategoryId,
    categories,
    urlState,
    mode,
    applyFilters,
    resetFilters
  } = useForumsSearchContext();

  const isSearchActive = mode !== ForumsMode.Browse;
  // The category scope only applies to a committed text search, so the picker follows the
  // committed query rather than the draft text.
  const hasQuery = urlState.query.length > 0;

  const [draftContentType, setDraftContentType] = useState<ContentType | ''>(
    isSearchActive ? contentType : ''
  );
  const [draftTimeRange, setDraftTimeRange] = useState<TimeRange | ''>(
    isSearchActive ? timeRange : ''
  );
  const [draftCategoryId, setDraftCategoryId] = useState<string | undefined>(
    isSearchActive ? filterCategoryId ?? CATEGORY_ALL : undefined
  );

  const handleApply = useCallback(() => {
    applyFilters({
      contentType: draftContentType || ContentType.Any,
      timeRange: draftTimeRange || TimeRange.All,
      categoryId: draftCategoryId
    });
    onClose();
  }, [draftContentType, draftTimeRange, draftCategoryId, applyFilters, onClose]);

  const handleReset = useCallback(() => {
    resetFilters();
    onClose();
  }, [resetFilters, onClose]);

  return (
    <SheetRoot open onOpenChange={open => !open && onClose()}>
      <SheetContent
        className='group-forums-search-filters-sheet'
        centerSheetSize='Medium'
        largeScreenVariant='center'
        closeLabel={translate('Action.Close')}>
        <SheetTitle>{translate('Action.Filters')}</SheetTitle>
        <SheetBody className='flex flex-col gap-xlarge padding-bottom-large'>
          <div className='flex flex-col gap-small'>
            <span className='text-title-medium'>{translate('Label.Content')}</span>
            <RadioGroup
              value={draftContentType}
              placement='End'
              onValueChange={value => setDraftContentType(value as ContentType)}>
              <Radio
                value={ContentType.Any}
                label={translate('Label.SearchAll')}
                aria-label={translate('Label.SearchAll')}
              />
              <Radio
                value={ContentType.Post}
                label={translate('Label.SearchPosts')}
                aria-label={translate('Label.SearchPosts')}
              />
              <Radio
                value={ContentType.Comment}
                label={translate('Label.SearchComments')}
                aria-label={translate('Label.SearchComments')}
              />
            </RadioGroup>
          </div>

          {hasQuery && (
            <div className='flex flex-col gap-small'>
              <span className='text-title-medium'>{translate('Label.Category')}</span>
              <RadioGroup
                value={draftCategoryId ?? ''}
                placement='End'
                onValueChange={value => setDraftCategoryId(value)}>
                <Radio
                  value={CATEGORY_ALL}
                  label={translate('Label.AllCategories')}
                  aria-label={translate('Label.AllCategories')}
                />
                {categories.map(category => (
                  <Radio
                    key={category.id}
                    value={category.id}
                    label={category.name}
                    aria-label={category.name}
                  />
                ))}
              </RadioGroup>
            </div>
          )}

          <div className='flex flex-col gap-small'>
            <span className='text-title-medium'>{translate('Label.TimeRange')}</span>
            <RadioGroup
              value={draftTimeRange}
              placement='End'
              onValueChange={value => setDraftTimeRange(value as TimeRange)}>
              <Radio
                value={TimeRange.Day}
                label={translate('Label.TimeRangeDay')}
                aria-label={translate('Label.TimeRangeDay')}
              />
              <Radio
                value={TimeRange.Week}
                label={translate('Label.TimeRangeWeek')}
                aria-label={translate('Label.TimeRangeWeek')}
              />
              <Radio
                value={TimeRange.Month}
                label={translate('Label.TimeRangeMonth')}
                aria-label={translate('Label.TimeRangeMonth')}
              />
              <Radio
                value={TimeRange.All}
                label={translate('Label.TimeRangeAll')}
                aria-label={translate('Label.TimeRangeAll')}
              />
            </RadioGroup>
          </div>
        </SheetBody>
        <SheetActions className='group-forums-search-filters-actions'>
          <Button variant='Emphasis' size='Medium' onClick={handleApply}>
            {translate('Action.Apply')}
          </Button>
          <Button variant='Standard' size='Medium' onClick={handleReset}>
            {translate('Action.Reset')}
          </Button>
        </SheetActions>
      </SheetContent>
    </SheetRoot>
  );
};

export default ForumsSearchFilters;
