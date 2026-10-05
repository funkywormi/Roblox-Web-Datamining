import type { FunctionComponent } from 'react';
import React from 'react';
import { Badge } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';

export type MemberCountChipProps = {
  count: number;
  max: number;
  className?: string;
};

const MemberCountChip: FunctionComponent<MemberCountChipProps> = ({ count, max, className }) => {
  const { translate } = useTranslation();

  return (
    <Badge
      label={translate('Description.EarlyTesterLimit', {
        numEarlyTesters: count.toString(),
        maxEarlyTesters: max.toString(),
      })}
      variant='Standard'
      shape='Box'
      size='XSmall'
      className={className}
    />
  );
};

export default MemberCountChip;
