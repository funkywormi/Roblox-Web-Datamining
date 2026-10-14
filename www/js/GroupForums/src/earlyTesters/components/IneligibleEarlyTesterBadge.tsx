import type { FunctionComponent } from 'react';
import React from 'react';
import { Badge, Tooltip, TooltipTrigger } from '@rbx/foundation-ui';
import { useTranslation, withTranslation } from '@rbx/intl';
import TranslationNamespace from '../../constants/TranslationNamespace';

// Shares the publishing invite screen's copy so both early tester flows read the same.
const IneligibleEarlyTesterBadge: FunctionComponent = () => {
  const { translateWithNamespace } = useTranslation();

  return (
    <Tooltip
      title={translateWithNamespace(
        TranslationNamespace.Publishing,
        'Tooltip.EarlyTesterIneligible',
      )}
      position='top-end'>
      <TooltipTrigger asChild>
        <Badge
          label={translateWithNamespace(TranslationNamespace.Publishing, 'Tooltip.CantInvite')}
          shape='Box'
        />
      </TooltipTrigger>
    </Tooltip>
  );
};

export default withTranslation(IneligibleEarlyTesterBadge, [TranslationNamespace.Publishing]);
