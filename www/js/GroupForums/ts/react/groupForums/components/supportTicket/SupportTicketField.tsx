import React from 'react';

export type SupportTicketFieldProps = {
  label: string;
  labelTestId?: string;
  children: React.ReactNode;
};

// Shared label-over-control layout for the bug-report form fields.
const SupportTicketField = ({
  label,
  labelTestId,
  children
}: SupportTicketFieldProps): JSX.Element => (
  <div className='flex flex-col gap-y-small'>
    <span className='text-label-medium' data-testid={labelTestId}>
      {label}
    </span>
    {children}
  </div>
);

SupportTicketField.displayName = 'SupportTicketField';

export default SupportTicketField;
