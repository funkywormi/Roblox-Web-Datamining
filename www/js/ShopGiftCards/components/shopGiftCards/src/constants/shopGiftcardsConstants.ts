export enum Country {
  Australia = "au",
  Austria = "at",
  Belgium = "be",
  Brazil = "br",
  Canada = "ca",
  Finland = "fi",
  France = "fr",
  Germany = "de",
  Greece = "gr",
  Ireland = "ie",
  Italy = "it",
  Japan = "jp",
  Mexico = "mx",
  Netherlands = "nl",
  NewZealand = "nz",
  Poland = "pl",
  Portugal = "pt",
  SaudiArabia = "sa",
  SouthAfrica = "za",
  Spain = "es",
  Switzerland = "ch",
  UnitedArabEmirates = "ae",
  UnitedKingdom = "uk",
  UnitedStates = "us",
}

enum Currency {
  AUD = "AUD", // Australian Dollar
  BRL = "BRL", // Brazilian Real
  CAD = "CAD", // Canadian Dollar
  CHF = "CHF", // Swiss Franc
  EUR = "EUR", // Euro
  GBP = "GBP", // Great British Pound
  JPY = "JPY", // Japanese Yen
  MXN = "MXN", // Mexican Peso
  USD = "USD", // American Dollar
}

export enum CardType {
  Digital = "digital",
  Physical = "physical",
}

export enum RecipientType {
  Self = "Self",
  Other = "Other",
}

export interface CurrencyConfig {
  currency: Currency;
  hasPhysicalCards?: boolean;
  useModifiedTitle?: boolean;
  cardBalanceOptions: {
    default: number;
    buttons: number[];
    all: number[];
  };
}

export const getCurrencyForCountry = (country: Country): Currency => {
  switch (country) {
    case Country.Austria:
    case Country.Belgium:
    case Country.Finland:
    case Country.France:
    case Country.Germany:
    case Country.Greece:
    case Country.Ireland:
    case Country.Italy:
    case Country.Netherlands:
    case Country.Poland:
    case Country.Portugal:
    case Country.Spain:
      return Currency.EUR;
    case Country.Australia:
      return Currency.AUD;
    case Country.Brazil:
      return Currency.BRL;
    case Country.Canada:
      return Currency.CAD;
    case Country.Japan:
      return Currency.JPY;
    case Country.Mexico:
      return Currency.MXN;
    case Country.Switzerland:
      return Currency.CHF;
    case Country.UnitedKingdom:
      return Currency.GBP;
    case Country.NewZealand:
    case Country.SaudiArabia:
    case Country.SouthAfrica:
    case Country.UnitedArabEmirates:
    case Country.UnitedStates:
    default:
      return Currency.USD;
  }
};

export const getCurrencyConfig = (location: Country): CurrencyConfig => {
  switch (getCurrencyForCountry(location)) {
    case Currency.AUD:
      return {
        currency: Currency.AUD,
        useModifiedTitle: true,
        cardBalanceOptions: {
          default: 25,
          buttons: [10, 25, 50, 100],
          all: [10, 15, 20, 25, 30, 35, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500],
        },
      };
    case Currency.BRL:
      return {
        currency: Currency.BRL,
        cardBalanceOptions: {
          default: 50,
          buttons: [25, 50, 75, 100],
          all: [25, 30, 35, 50, 55, 60, 75, 100, 250, 500],
        },
      };
    case Currency.CAD:
      return {
        currency: Currency.CAD,
        hasPhysicalCards: true,
        cardBalanceOptions: {
          default: 25,
          buttons: [15, 25, 50, 100],
          all: [15, 20, 25, 30, 35, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500],
        },
      };
    case Currency.CHF:
      return {
        currency: Currency.CHF,
        cardBalanceOptions: {
          default: 25,
          buttons: [10, 25, 50, 100],
          all: [10, 15, 20, 25, 30, 40, 50, 75, 100],
        },
      };
    case Currency.EUR:
      return {
        currency: Currency.EUR,
        cardBalanceOptions: {
          default: 25,
          buttons: [10, 25, 50, 100],
          all: [10, 15, 20, 25, 30, 35, 40, 50, 60, 100],
        },
      };
    case Currency.GBP:
      return {
        currency: Currency.GBP,
        cardBalanceOptions: {
          default: 25,
          buttons: [10, 25, 50, 100],
          all: [10, 15, 20, 25, 30, 35, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500],
        },
      };
    case Currency.JPY:
      return {
        currency: Currency.JPY,
        cardBalanceOptions: {
          default: 3000,
          buttons: [1000, 3000, 5000, 10000],
          all: [1000, 1500, 1600, 1800, 2000, 2500, 3000, 3200, 5000, 10000],
        },
      };
    case Currency.MXN:
      return {
        currency: Currency.MXN,
        cardBalanceOptions: {
          default: 150,
          buttons: [125, 150, 200, 300],
          all: [125, 130, 135, 150, 200, 250, 300, 400, 500, 1000],
        },
      };
    case Currency.USD:
    default:
      return {
        currency: Currency.USD,
        hasPhysicalCards: true,
        cardBalanceOptions: {
          default: 25,
          buttons: [10, 25, 50, 100],
          all: [10, 15, 20, 25, 30, 35, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500],
        },
      };
  }
};

export const config = {
  cashstarFormUrl: "https://roblox.cashstar.com/store/?ref=shopgiftcards",
  defaultFaceplateIds: {
    digital: "DTCPGTNS5",
    physical: "DCXRK7FKN",
  },
  giftMessageMaxLength: 250,
  defaultCountry: "us",
  countriesWithPhysicalCards: ["ca", "us"],
};

export const translationKeys = {
  header: {
    maintitle: "Description.GiftCards",
  },

  hero: {
    title: "Description.EnjoyMoreRobux",
    modifiedTitle: "Description.GetBonusRobux",
    footer: "Description.GetMoreRobuxWithGiftCards",
    promoTitle: "Description.LimitedTimeOffer",
    promoSubtitle: "Description.September2026Promo",
  },

  form: {
    cardTypeHeader: "Description.WhatCard",
    cardTypeFooter: "Description.PhysicalCardDisabled",
    cardAmountHeader: "Description.Amount",
    cardAmountDropdownPlaceholder: "Description.OtherAmount",
    recipientHeader: "Description.WhoIsThisFor",
    cashstar: "Message.PoweredByCashstar",
  },

  buttons: {
    digital: "Description.DigitalCard",
    physical: "Description.PhysicalCard",
    recipientMe: "Description.ForMe",
    recipientOther: "Description.ForAFriend",
    submit: "Description.AddToCart",
  },

  recipientInfo: {
    recipientLabel: "Description.RecipientName",
    senderLabel: "Description.YourName",
    messageLabel: "Description.GiftMessage",
  },

  footer: {
    copyright: "Description.CopyrightLanguage",
    terms: "Description.Terms",
    privacy: "Description.Privacy",
  },
};
