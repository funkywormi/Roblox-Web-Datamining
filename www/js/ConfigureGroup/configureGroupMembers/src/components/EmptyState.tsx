import type { FunctionComponent, ReactNode } from 'react';
import React from 'react';
import StatePanel from './StatePanel';
import ThemedImage from './ThemedImage';

export type EmptyStateIllustration = {
  light: string;
  dark: string;
};

export type EmptyStateProps = {
  illustration: EmptyStateIllustration;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

const EmptyState: FunctionComponent<EmptyStateProps> = ({
  illustration,
  title,
  description,
  action,
  className,
}) => (
  <StatePanel
    className={className}
    testId='group-management-empty-state'
    titleClassName='text-heading-medium'
    illustration={
      // Figma frames the empty-state pictogram in a 115×180 box with the glyph centered.
      <div className='flex items-center justify-center overflow-hidden width-[115px] height-[180px]'>
        <ThemedImage
          lightSrc={illustration.light}
          darkSrc={illustration.dark}
          alt=''
          className='shrink-0'
        />
      </div>
    }
    title={title}
    description={description}
    action={action}
  />
);

export default EmptyState;
