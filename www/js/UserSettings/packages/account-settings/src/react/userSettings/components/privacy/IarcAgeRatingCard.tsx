import React from "react";
import { Badge, OptionSelector } from "@rbx/foundation-ui";
import { TAgeRatingEntry } from "../../constants/privacy/iarcAgeRatingRegistry";

// Authority-issued descriptions run long, so an unselected rating shows an excerpt and the
// selected one shows all of it. OptionSelector only clamps the label, not the description.
const clampedDescriptionStyle: React.CSSProperties = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 3,
  overflow: "hidden",
};

export type TIarcAgeRatingCardProps = {
  entry: TAgeRatingEntry;
  isSelected: boolean;
  isDisabled: boolean;
  /**
   * What the user has to complete before this rating becomes available to them, e.g. parental
   * consent or age verification. Rendered between the label and the description.
   */
  requirementHint?: string;
  /**
   * Copy for the badge marking this rating as the one an outstanding parental consent request was
   * sent for. Omitted when there is no request for it.
   */
  pendingLabel?: string;
  onSelect: (messageId: string) => void;
};

export const IarcAgeRatingCard = ({
  entry,
  isSelected,
  isDisabled,
  requirementHint,
  pendingLabel,
  onSelect,
}: TIarcAgeRatingCardProps): JSX.Element => (
  <div data-testid={`iarc-age-rating-card-${entry.messageId}`} data-selected={isSelected}>
    <OptionSelector
      layout="Horizontal"
      size="Medium"
      type="Checkmark"
      label={
        pendingLabel ? (
          <span className="flex items-center gap-small">
            {entry.label}
            <span data-testid={`iarc-age-rating-pending-${entry.messageId}`}>
              <Badge variant="Neutral" icon="icon-regular-clock" label={pendingLabel} />
            </span>
          </span>
        ) : (
          entry.label
        )
      }
      description={
        <span style={isSelected ? undefined : clampedDescriptionStyle}>{entry.description}</span>
      }
      metadata={
        requirementHint ? (
          <span data-testid={`iarc-age-rating-requirement-${entry.messageId}`}>
            {requirementHint}
          </span>
        ) : undefined
      }
      media={<img className="width-full radius-small" src={entry.iconUrl} alt="" loading="lazy" />}
      isSelected={isSelected}
      isDisabled={isDisabled}
      onSelect={() => onSelect(entry.messageId)}
    />
  </div>
);

export default IarcAgeRatingCard;
