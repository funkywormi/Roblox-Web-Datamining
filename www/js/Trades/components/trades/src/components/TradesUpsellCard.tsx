import { Button, Icon, IconButton } from "@rbx/foundation-ui";

export type TradesUpsellCardProps = {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  dismissLabel: string;
  onCtaClick?: () => void;
  onDismiss: () => void;
};

/**
 * Membership upsell shown above the trades list, pitching Plus as the way to
 * lift the monthly completed-trade cap.
 */
export const TradesUpsellCard = ({
  title,
  body,
  ctaLabel,
  ctaHref,
  dismissLabel,
  onCtaClick,
  onDismiss,
}: TradesUpsellCardProps): JSX.Element => (
  <div className="trades-upsell-card">
    <div className="trades-upsell-card-content">
      <div className="trades-upsell-card-copy">
        <div className="trades-upsell-card-title">{title}</div>
        <div className="trades-upsell-card-body">{body}</div>
      </div>

      <Button as="a" href={ctaHref} onClick={onCtaClick} variant="SoftEmphasis" size="Small">
        {ctaLabel}
      </Button>
    </div>

    <div className="trades-upsell-card-media">
      <span className="tilted-glyph-frame" />
      <Icon name="icon-regular-roblox-plus" className="tilted-glyph" size="XXLarge" />
    </div>

    <IconButton
      className="trades-upsell-card-dismiss"
      icon="icon-regular-x"
      ariaLabel={dismissLabel}
      variant="OverMedia"
      size="XSmall"
      isCircular
      onClick={onDismiss}
    />
  </div>
);

export default TradesUpsellCard;
