import { Badge, ContextBanner, Icon } from "@rbx/foundation-ui";

export type TradesQuotaBannerProps = {
  message: string;
  endsLabel: string;
};

/**
 * Free-trade counter shown above the trades list, badged with the date the
 * allowance promotion stops running.
 */
export const TradesQuotaBanner = ({ message, endsLabel }: TradesQuotaBannerProps): JSX.Element => (
  <ContextBanner
    className="trades-quota-banner"
    density="Default"
    leading={<Icon name="icon-regular-hand-two-arrows-horizontal" size="Medium" />}
    trailing={<Badge icon="icon-regular-clock" label={endsLabel} shape="Box" />}
  >
    <span className="trades-quota-banner-message">{message}</span>
  </ContextBanner>
);

export default TradesQuotaBanner;
