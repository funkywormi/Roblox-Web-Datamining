import React from "react";

type Props = {
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

export const ModernCardBody: React.FC<Props> = ({ children }: Props) => {
  return <div className="card-body">{children}</div>;
};

export default ModernCardBody;
