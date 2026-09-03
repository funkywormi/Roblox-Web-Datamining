import { Button, Icon, TButtonVariant } from "@rbx/foundation-ui";

export type TradesEmptyStateProps = {
  title: string;
  subtitle: string;
  /** Omit to render the empty state without a call to action. */
  action?: {
    label: string;
    /** Omit to render the action as a button rather than a link. */
    href?: string;
    onClick?: () => void;
    variant?: TButtonVariant;
  };
  /** Extra class on the root, for callers that need different spacing. */
  className?: string;
};

/**
 * Placeholder for an empty list: tilted artwork, a title and subtitle, and an
 * optional call to action. Shared by the trades list and the item inventory.
 */
export const TradesEmptyState = ({
  title,
  subtitle,
  action,
  className,
}: TradesEmptyStateProps): JSX.Element => (
  <div className={`col-xs-12 trades-empty-state${className ? ` ${className}` : ""}`}>
    <div className="trades-empty-state-art">
      <span className="tilted-glyph-frame" />
      <Icon
        name="icon-regular-hand-two-arrows-horizontal"
        className="tilted-glyph"
        size="XXLarge"
      />
    </div>

    <div className="trades-empty-state-copy">
      <div className="trades-empty-state-title">{title}</div>
      <div className="trades-empty-state-subtitle">{subtitle}</div>
    </div>

    {action &&
      (action.href ? (
        <Button
          as="a"
          href={action.href}
          onClick={action.onClick}
          variant={action.variant ?? "Standard"}
          size="Medium"
        >
          {action.label}
        </Button>
      ) : (
        <Button onClick={action.onClick} variant={action.variant ?? "Standard"} size="Medium">
          {action.label}
        </Button>
      ))}
  </div>
);

export default TradesEmptyState;
