import { Checkbox, Icon } from "@rbx/foundation-ui";
import { PriceTag } from "@rbx/payments/priceTag";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { useTranslations } from "@rbx/www-common/i18n";
import { SubscribedRobuxProductOffer } from "../services/paymentsGatewayService";

type Props = {
  isChecked: boolean;
  onToggle: () => void;
  offer: SubscribedRobuxProductOffer;
};

const priceAmount = ({
  amount: { nanos, units },
}: SubscribedRobuxProductOffer["initialPrice"]): number => Number(units ?? 0) + (nanos ?? 0) / 1e9;

export default function SubscribeAndSaveQuickPayOffer({
  isChecked,
  onToggle,
  offer: { initialPrice, recurringPrice, robuxAmount },
}: Props) {
  const translate = useTranslations("Feature.Payment");

  return (
    <div className="margin-top-small" data-testid="quick-pay-subscribe-and-save-offer">
      <Checkbox
        label={
          // Checkbox renders the rich ReactNode[] despite typing label as string.
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          translate.html(
            "Label.SubscribeAndSaveV2",
            [
              {
                opening: "robuxIconStart",
                closing: "robuxIconEnd",
                render: () => (
                  <Icon
                    name="icon-regular-robux"
                    size="Small"
                    style={{ verticalAlign: "text-top" }}
                  />
                ),
              },
              {
                opening: "initialPriceStart",
                closing: "initialPriceEnd",
                render: () => (
                  <PriceTag
                    amount={priceAmount(initialPrice)}
                    currencyCode={initialPrice.amount.currencyCode}
                    tagClassName="line-through"
                  />
                ),
              },
              {
                opening: "recurringPriceStart",
                closing: "recurringPriceEnd",
                render: () => (
                  <PriceTag
                    amount={priceAmount(recurringPrice)}
                    currencyCode={recurringPrice.amount.currencyCode}
                  />
                ),
              },
              {
                opening: "subscriptionTermsStart",
                closing: "subscriptionTermsEnd",
                render: children => (
                  <a
                    href="https://en.help.roblox.com/hc/en-us/articles/46804865425300-Roblox-Subscription-Terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="content-link underline"
                  >
                    {children}
                  </a>
                ),
              },
            ],
            {
              robuxAmount: formatNumber(robuxAmount),
            },
          ) as unknown as string
        }
        size="Medium"
        placement="Start"
        onCheckedChange={onToggle}
        isChecked={isChecked}
      />
    </div>
  );
}
