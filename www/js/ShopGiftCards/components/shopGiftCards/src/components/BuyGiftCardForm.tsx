import { useCallback, useMemo, useState } from "react";
import classNames from "classnames";
import { WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { Button, Divider, MenuItem, Select, TextField, Typography } from "@rbx/ui";
import {
  CardType,
  config,
  Country,
  CurrencyConfig,
  RecipientType,
  translationKeys,
} from "../constants/shopGiftcardsConstants";
import { UseGiftCardAnalyticsResponse } from "../hooks/useGiftCardAnalytics";
import useLocale from "../hooks/useLocale";

type BuyGiftCardFormProps = {
  country: Country;
  currencyConfig: CurrencyConfig;
  searchParams: URLSearchParams;
  giftCardAnalytics: UseGiftCardAnalyticsResponse;
} & WithTranslationsProps;

const BuyGiftCardForm: React.FC<BuyGiftCardFormProps> = ({
  translate,
  country,
  currencyConfig: { cardBalanceOptions, currency },
  searchParams,
  giftCardAnalytics,
}: BuyGiftCardFormProps): JSX.Element => {
  const locale = useLocale();

  const [cardType, setCardType] = useState<CardType>(CardType.Digital);
  const [recipient, setRecipient] = useState<RecipientType>(RecipientType.Self);
  const [cardBalance, setCardBalance] = useState<number>(cardBalanceOptions.default);
  const [giftMessage, setGiftMessage] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [senderName, setSenderName] = useState<string>("");

  const { trackSetCardBalance, trackSetCardType, trackSetRecipientType, trackAddToCart } =
    giftCardAnalytics;

  const formAction = new URL(config.cashstarFormUrl);
  searchParams.forEach((value, key) => {
    if (key !== "location") formAction.searchParams.set(key, value);
  });
  if (locale) {
    formAction.searchParams.set("locale", locale);
  }

  const giftMessageLength = (): string =>
    `${giftMessage?.length || 0}/${config.giftMessageMaxLength}`;

  const getCardAmountDropdownOptions = useMemo((): number[] => {
    return cardBalanceOptions.all.filter(amount => !cardBalanceOptions.buttons.includes(amount));
  }, [cardBalanceOptions.all, cardBalanceOptions.buttons]);

  const formatPrice = useCallback(
    (price: number): string => {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(price);
    },
    [currency],
  );

  const getPriceRange = useCallback((): string => {
    return `${translate(translationKeys.form.cardAmountHeader)} (${formatPrice(
      Math.min(...cardBalanceOptions.all),
    )} - ${formatPrice(Math.max(...cardBalanceOptions.all))})`;
  }, [cardBalanceOptions.all, formatPrice, translate]);

  const handleSetCardBalance = useCallback(
    (amount: number) => {
      setCardBalance(amount);
      trackSetCardBalance(amount);
    },
    [trackSetCardBalance],
  );

  const handleSetCardType = useCallback(
    (type: CardType) => {
      setCardType(type);
      trackSetCardType(type);
    },
    [trackSetCardType],
  );

  const handleSetRecipientType = useCallback(
    (type: RecipientType) => {
      setRecipient(type);
      trackSetRecipientType(type);
    },
    [trackSetRecipientType],
  );

  const isSelfBuy = (): string => (recipient === RecipientType.Self ? "TRUE" : "FALSE");
  const hasPhysicalCards = config.countriesWithPhysicalCards.includes(country);

  return (
    <form name="purchase" action={formAction.href} method="post">
      <input type="hidden" name="currencyCode" value={currency} />
      <input type="hidden" name="faceplateCode" value={config.defaultFaceplateIds[cardType]} />
      <input type="hidden" name="amount" value={cardBalance} />
      <input type="hidden" name="cardType" value={cardType} />
      <input type="hidden" name="selfBuy" value={isSelfBuy()} />
      <input type="hidden" name="locale" value={document.documentElement.lang} />
      <input
        type="hidden"
        name="recipientName"
        value={recipientName}
        disabled={recipientName.length === 0}
      />
      <input
        type="hidden"
        name="senderName"
        value={senderName}
        disabled={senderName.length === 0}
      />
      <input type="hidden" name="message" value={giftMessage} disabled={giftMessage.length === 0} />

      <div className="form-row card-type">
        <div className="card-type-header">
          <Typography className="text-form-title" variant="h5" color="primary">
            {translate(translationKeys.form.cardTypeHeader)}
          </Typography>
        </div>

        <div className="card-type-buttons button-row">
          <Button
            className={classNames("text-button", { selected: cardType === CardType.Digital })}
            color="secondary"
            size="large"
            variant="outlined"
            onClick={() => {
              handleSetCardType(CardType.Digital);
            }}
          >
            {translate(translationKeys.buttons.digital)}
          </Button>

          <Button
            className={classNames("text-button", { selected: cardType === CardType.Physical })}
            color="secondary"
            size="large"
            variant="outlined"
            onClick={() => {
              handleSetCardType(CardType.Physical);
            }}
            disabled={!hasPhysicalCards}
          >
            {translate(translationKeys.buttons.physical)}
          </Button>
        </div>

        {!hasPhysicalCards && (
          <Typography className="text-form-caption" variant="smallLabel1">
            {translate(translationKeys.form.cardTypeFooter)}
          </Typography>
        )}
      </div>

      <div className="form-row card-amount">
        <div className="inline-label">
          <Typography className="text-form-title" variant="h5" color="primary">
            {getPriceRange()}
          </Typography>

          <Typography className="card-amount-currency text-default" variant="body2" color="primary">
            {currency}
          </Typography>
        </div>

        <div className="card-amount-grid">
          {cardBalanceOptions.buttons.map(amount => {
            return (
              <Button
                className={classNames("text-button", { selected: amount === cardBalance })}
                color="secondary"
                size="small"
                variant="outlined"
                key={amount}
                onClick={() => {
                  handleSetCardBalance(amount);
                }}
              >
                {amount}
              </Button>
            );
          })}

          <Select
            className="select"
            helperText=""
            label="Other"
            margin="none"
            size="small"
            variant="outlined"
            onChange={e => {
              handleSetCardBalance(Number(e.target.value));
            }}
            value={getCardAmountDropdownOptions.includes(cardBalance) ? cardBalance : ""}
          >
            {getCardAmountDropdownOptions.map(amount => {
              return (
                <MenuItem value={amount} key={amount}>
                  {amount}
                </MenuItem>
              );
            })}
          </Select>
        </div>
      </div>

      <div className="horizontal-divider">
        <Divider orientation="horizontal" size="medium" variant="fullWidth" />
      </div>

      <div className="form-row recipient">
        <div className="recipient-header">
          <Typography className="text-form-title" variant="h5" color="primary">
            {translate(translationKeys.form.recipientHeader)}
          </Typography>
        </div>

        <div className="card-type-buttons button-row">
          <Button
            className={classNames("text-button", { selected: recipient === RecipientType.Self })}
            color="secondary"
            size="large"
            variant="outlined"
            onClick={() => {
              handleSetRecipientType(RecipientType.Self);
            }}
          >
            {translate(translationKeys.buttons.recipientMe)}
          </Button>

          <Button
            className={classNames("text-button", { selected: recipient === RecipientType.Other })}
            color="secondary"
            size="large"
            variant="outlined"
            onClick={() => {
              handleSetRecipientType(RecipientType.Other);
            }}
          >
            {translate(translationKeys.buttons.recipientOther)}
          </Button>
        </div>
      </div>

      <div
        className={classNames("form-row recipient-info", {
          hidden: recipient === RecipientType.Self,
        })}
      >
        <div className="stacked-input">
          <label className="text-form-title" htmlFor="recipient-name">
            {translate(translationKeys.recipientInfo.recipientLabel)}
          </label>

          <TextField
            id="recipient-name"
            helperText=""
            label=""
            margin="none"
            size="medium"
            variant="outlined"
            fullWidth
            onChange={e => {
              setRecipientName(e.target.value);
            }}
          />
        </div>

        <div className="stacked-input">
          <label className="text-form-title" htmlFor="sender-name">
            {translate(translationKeys.recipientInfo.senderLabel)}
          </label>

          <TextField
            id="sender-name"
            helperText=""
            label=""
            margin="none"
            size="medium"
            variant="outlined"
            fullWidth
            onChange={e => {
              setSenderName(e.target.value);
            }}
          />
        </div>

        <div className="stacked-input">
          <label className="inline-label text-form-title" htmlFor="gift-message">
            {translate(translationKeys.recipientInfo.messageLabel)}
            <Typography className="text-default" variant="body2" color="primary">
              {giftMessageLength()}
            </Typography>
          </label>

          <TextField
            id="gift-message"
            label=""
            margin="none"
            size="medium"
            variant="outlined"
            fullWidth
            multiline
            minRows={3}
            onChange={e => {
              setGiftMessage(e.target.value);
            }}
            inputProps={{ maxLength: 250 }}
          />
        </div>
      </div>

      <div className="form-row submit">
        <Button
          className="text-mainbutton"
          type="submit"
          color="primaryBrand"
          fullWidth
          size="large"
          variant="contained"
          onClick={trackAddToCart}
        >
          {translate(translationKeys.buttons.submit)}
        </Button>

        <Typography className="text-mainbutton-caption" variant="footer" color="primary">
          {translate(translationKeys.form.cashstar)}
        </Typography>
      </div>
    </form>
  );
};

export default BuyGiftCardForm;
