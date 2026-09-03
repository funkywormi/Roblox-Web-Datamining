import React from 'react';
import { formatNumber } from '@rbx/core-scripts/format/number';

export type RobuxPackageDetailsProps = {
  robuxAmount: number;
  price: string;
};

const RobuxUpsellPackageDetails: React.FC<RobuxPackageDetailsProps> = ({ robuxAmount, price }) => {
  return (
    <div
      className='rounded-xxlarge radius-medium border padding-medium'
      style={{ borderColor: 'var(--content-action-standard)' }}>
      <div className='flex flex-row items-center justify-between gap-medium'>
        <div className='flex flex-row items-center'>
          <span className='icon-robux-16x16' />
          <span className='text-heading-small margin-left-xsmall'>
            {formatNumber(robuxAmount)}
          </span>
        </div>
        <div className='text-label-large'>{price}</div>
      </div>
    </div>
  );
};

export default RobuxUpsellPackageDetails;
