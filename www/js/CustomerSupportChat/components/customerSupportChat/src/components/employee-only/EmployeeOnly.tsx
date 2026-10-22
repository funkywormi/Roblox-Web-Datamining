import React from "react";
import { Icon } from "@rbx/foundation-ui";
import "./EmployeeOnly.scss";

const EMPLOYEE_ONLY_LABEL = "Debug · only visible to employees";

type EmployeeOnlyProps = React.PropsWithChildren<{
  className?: string;
  "data-testid"?: string;
}>;

/** Marks employee tooling so it can't be mistaken for part of the experience in a screenshot. */
const EmployeeOnly: React.FC<EmployeeOnlyProps> = ({
  children,
  className = "",
  "data-testid": testId,
}) => (
  <div
    className={`support-employee-only flex items-center gap-xsmall padding-x-small padding-y-xsmall radius-medium stroke-standard stroke-default text-caption-medium content-muted ${className}`}
    data-testid={testId}
  >
    <Icon name="icon-regular-eye-slash" size="Small" className="shrink-0" />
    <span className="content-emphasis">{EMPLOYEE_ONLY_LABEL}</span>
    <span aria-hidden="true">&middot;</span>
    {children}
  </div>
);

export default EmployeeOnly;
