import React from 'react';
import range from 'lodash/range';

export function ShimmerMenu(): JSX.Element {
  return (
    <div id='search-options' className='search-options'>
      <ul className='search-options-progressive-loading shimmer-lines'>
        {range(9).map(i => (
          <li key={i} className='placeholder shimmer-line' />
        ))}
      </ul>
    </div>
  );
}

export default ShimmerMenu;
