import React, { Fragment, FunctionComponent } from 'react';
import { Tooltip } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { TransactionItem } from '../../../../ts';

interface LicensedTooltipProps {
  includeSeparator: boolean;
  item?: TransactionItem | null;
  translate: TranslateFunction;
}

const LicensedTooltip: FunctionComponent<LicensedTooltipProps> = ({
  includeSeparator,
  item,
  translate
}) => {
  if (!item || !item.hasLicensingFee) {
    return null;
  }

  return (
    <Fragment>
      {/* eslint-disable-next-line react/jsx-no-literals */}
      {includeSeparator && <span className='item-card-label text-overflow'>•</span>}
      <span className='item-card-label text-overflow'>{translate('Label.Licensed')}</span>
      <Tooltip
        id='licensed-tooltip'
        content={translate('Label.LicensedTooltip')}
        placement='top'
        data-testid='licensed-tooltip'>
        <span className='item-card-label text-overflow icon-moreinfo-16x16' />
      </Tooltip>
    </Fragment>
  );
};

export default LicensedTooltip;
