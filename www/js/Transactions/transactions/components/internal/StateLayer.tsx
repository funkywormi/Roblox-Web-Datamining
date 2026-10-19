import clsx from 'clsx';
import React from 'react';

export const interactable =
  'relative clip group/interactable focus-visible:outline-focus disabled:outline-none';

type TStateLayerProps = {
  className?: string;
};

export const StateLayer = ({ className }: TStateLayerProps) => (
  <div
    aria-hidden
    data-testid='foundation-web-state-layer'
    className={clsx(
      'absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)] group-disabled/interactable:bg-none',
      className
    )}
  />
);
