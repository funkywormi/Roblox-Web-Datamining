/**
 * This file is covered implicitly by the EppDetails component unit tests.
 */
import { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";
import { Button, Icon, ListItem, TListItemProps } from "@rbx/foundation-ui";
import React from "react";

export enum ChecklistStatus {
  INCOMPLETE = 0,
  PENDING = 1,
  COMPLETE = 2,
  LOADING = 3,
}

export type EppChecklistItemSecondaryAction = {
  text: string;
  onClick: () => void;
  variant?: "Standard" | "Alert";
  dataTestId?: string;
};

export type EppChecklistItemProps = {
  titleText: string;
  bodyText?: string;
  defaultLoadingText: string;
  buttonText?: string;
  checklistStatus: ChecklistStatus;
  onClick: () => void;
  secondaryAction?: EppChecklistItemSecondaryAction;

  // test-only..
  dataTestId?: string;
};

export const mapStatusToListItemIcon = (
  status: ChecklistStatus,
): {
  icon: TTailwindIconClass; // Necessary for type constraining for consumption below.
  themeClassName: string;
} => {
  switch (status) {
    case ChecklistStatus.COMPLETE:
      return { icon: "icon-regular-circle-check", themeClassName: "content-system-success" };
    case ChecklistStatus.PENDING:
      return {
        icon: "icon-regular-clock-dashed",
        themeClassName: "content-system-neutral",
      };
    case ChecklistStatus.LOADING:
      return {
        icon: "icon-regular-circle-three-dots-horizontal",
        themeClassName: "content-system-neutral",
      };
    default:
      return { icon: "icon-regular-circle-x", themeClassName: "content-system-alert" };
  }
};

export const EppChecklistItem: React.FC<EppChecklistItemProps> = ({
  titleText,
  bodyText,
  defaultLoadingText,
  buttonText,
  checklistStatus,
  onClick,
  secondaryAction,
  dataTestId,
}) => {
  const loading = checklistStatus === ChecklistStatus.LOADING;
  const { icon, themeClassName } = mapStatusToListItemIcon(checklistStatus);
  const constantListItemProps: Omit<TListItemProps, "text" | "title"> = {
    divider: "None",
    isContained: true,
    leading: <Icon name={icon} size="Small" className={themeClassName} />,
    trailing: (
      <div style={{ display: "flex", gap: "8px" }}>
        <Button
          size="Medium"
          variant="Standard"
          isLoading={loading}
          onClick={onClick}
          isDisabled={loading}
          data-testid={dataTestId}
        >
          {buttonText}
        </Button>
        {secondaryAction && !loading && (
          <Button
            size="Medium"
            variant={secondaryAction.variant ?? "Standard"}
            onClick={secondaryAction.onClick}
            data-testid={secondaryAction.dataTestId}
          >
            {secondaryAction.text}
          </Button>
        )}
      </div>
    ),
  };
  if (loading) {
    return <ListItem {...constantListItemProps} title={defaultLoadingText} />;
  }

  return <ListItem {...constantListItemProps} title={titleText} text={bodyText} />;
};
