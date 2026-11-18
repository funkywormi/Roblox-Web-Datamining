import React from "react";

type Props = {
  headerText: string;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * A header for the modern card component.
 */
export const ModernCardHeader: React.FC<Props> = ({ headerText, children }: Props) => {
  return (
    <div className="card-header">
      {/* TODO: The latest account recovery design uses text-heading-small for this header on all screens. */}
      <span className="card-title text-heading-large">{headerText}</span>
      {children}
    </div>
  );
};

export default ModernCardHeader;
