import clsx from 'clsx';
import React from 'react';

export type TBeakProps = {
  className?: string;
};

/**
 * Beak (Arrow) component for tooltips and popovers.
 */
export function Beak({ className }: TBeakProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='13'
      height='6'
      viewBox='0 0 13 6'
      fill='none'
      className={clsx('block', className)}
      style={{ marginTop: -1 }}>
      <path
        d='M0.249999 0.666628L4.83579 5.25241C5.61683 6.03346 6.88316 6.03346 7.66421 5.25241L12.25 0.666626L0.249999 0.666628Z'
        fill='currentColor'
      />
    </svg>
  );
}
