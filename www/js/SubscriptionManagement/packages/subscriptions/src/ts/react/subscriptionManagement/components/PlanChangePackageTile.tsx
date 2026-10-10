import React from "react";
import { Button, Card, Icon, List } from "@rbx/foundation-ui";

export type PlanChangePackageBenefit = {
  iconName: React.ComponentProps<typeof Icon>["name"];
  text: string;
};

type PlanChangePackageTileProps = {
  title: string;
  price: string;
  strikethroughPrice?: string | null;
  benefits: PlanChangePackageBenefit[];
  actionLabel: string;
  isActionLoading: boolean;
  onAction: () => void;
};

const PlanChangePackageTile: React.FC<PlanChangePackageTileProps> = ({
  title,
  price,
  strikethroughPrice,
  benefits,
  actionLabel,
  isActionLoading,
  onAction,
}) => (
  <Card density="Compact" variant="Emphasis">
    <div className="gap-large flex flex-col">
      <div className="gap-large flex items-center justify-between">
        <h3 className="text-label-large content-emphasis text-truncate-end margin-none">{title}</h3>
        <div className="gap-small flex shrink-0 items-center">
          {strikethroughPrice && (
            <span className="text-title-medium content-muted line-through text-no-wrap">
              {strikethroughPrice}
            </span>
          )}
          <span className="text-title-medium content-emphasis text-no-wrap">{price}</span>
        </div>
      </div>
      <List className="gap-medium flex flex-col">
        {benefits.map(({ iconName, text }) => (
          <li key={text} className="gap-medium medium:gap-large flex items-center">
            <Icon name={iconName} size="Medium" />
            <span className="text-body-medium content-default">{text}</span>
          </li>
        ))}
      </List>
      <Button
        className="width-full"
        isLoading={isActionLoading}
        size="Medium"
        variant="Standard"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  </Card>
);

export default PlanChangePackageTile;
