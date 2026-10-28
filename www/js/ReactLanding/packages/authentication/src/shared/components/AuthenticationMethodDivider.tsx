import React from "react";
import { Divider } from "@rbx/foundation-ui";

export type AuthenticationMethodDividerProps = {
  label: string;
};

const centerLine = { alignSelf: "center" } as const;

const AuthenticationMethodDivider = ({
  label,
}: AuthenticationMethodDividerProps): React.JSX.Element => (
  <div className="flex width-full items-center gap-medium" data-testid="authentication-divider">
    <Divider className="grow-1 basis-0" style={centerLine} aria-hidden="true" />
    <span className="content-muted text-caption-small">{label}</span>
    <Divider className="grow-1 basis-0" style={centerLine} aria-hidden="true" />
  </div>
);

export default AuthenticationMethodDivider;
