import React from "react";

type Props = {
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * A generic card container. Styled similarly to our modals (modalModern), but
 * isn't an overlay.
 */
export const ModernCardContainer: React.FC<Props> = ({ children }: Props) => {
  return <div className="modern-card-container">{children}</div>;
};

export default ModernCardContainer;
