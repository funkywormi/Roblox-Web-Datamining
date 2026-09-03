import React from 'react';

export type ShimmerContainerProps = {
  numberOfItemsToDisplay: number;
  shimmerCardClassName?: string;
};

export function ShimmerContainer({
  numberOfItemsToDisplay,
  shimmerCardClassName
}: ShimmerContainerProps): JSX.Element {
  const items = Array.from({ length: numberOfItemsToDisplay }, (_, i) => i);

  return (
    <ul id='catalog-react-shimmer-container' className='hlist item-cards-stackable'>
      {items.map((item, index) => (
        <li key={item} className={shimmerCardClassName ?? 'list-item item-card'}>
          <div className='item-card-container'>
            <div className='item-card-link'>
              <div className='item-card-thumb-container'>
                <div className='shimmer item-card-thumb-progressive-loading' />
              </div>
            </div>
            <ul className='item-card-caption-progressive-loading shimmer-lines'>
              <li className='placeholder shimmer-line' />
              <li className='placeholder shimmer-line' />
              <li className='placeholder shimmer-line' />
            </ul>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default ShimmerContainer;
