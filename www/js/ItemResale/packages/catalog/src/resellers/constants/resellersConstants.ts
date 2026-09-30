export const resellersConstants = {
  fetchTradePermissionsBatchSize: 5,
  resaleChartDayOptions: [30, 90, 180],

  errorBannerTimeout: 5000,

  resellersPageSize: 10,
  resellersLoadPageSize: 100,

  translationKeys: {
    notAvailable: "Label.NotAvailable",
    putForSaleFailure: "Message.PutForSaleFailure",
    takeOffSaleFailure: "Message.TakeOffSaleFailure",
  },

  eventStream: {
    context: {
      resellersList: "resellersList",
    },
    name: {
      buyBtn: "buyBtn",
      tradeBtn: "tradeBtn",
      upgradeBtn: "upgradeBtn",
      nonPremiumTradeBtn: "nonPremiumTradeBtn",
    },
  },

  highCharts: {
    marginLeft: 50,
    lineChartHeight: 130,
    verticalBarChartHeight: 50,
    itemDelimiter: ",",
    lineDelimiter: "|",
    colors: {
      backgroundColor: "transparent",
      lineColor: "#02b757",
      verticalBarColor: "#b8b8b8",
      borderColor: "#757575",
      pointColor: "#fff",
    },
  },

  resellersTabs: {
    priceChart: "priceChart",
    resellers: "resellers",
    inventory: "inventory",
  },

  purchaseEvent: {
    name: "angular-to-react-purchase-event",
    identifier: "limited-reseller-list",
  },

  resaleRestrictionDisabled: 2,

  errorCodes: {
    internal: {
      unknown: 0,
    },
    economyApi: {
      priceTooLow: 6,
      priceTooHigh: 7,
      unowned: 8,
    },
  },
} as const;

export type TResellersTab =
  (typeof resellersConstants.resellersTabs)[keyof typeof resellersConstants.resellersTabs];

export default resellersConstants;
