import { EnvironmentUrls } from 'Roblox';
import resellersModule from '../resellersModule.js';

const resellersConstants = {
  urls: {
    getResellers: `${EnvironmentUrls.economyApi}/v1/assets/{assetId}/resellers`,
    getResaleData: `${EnvironmentUrls.economyApi}/v1/assets/{assetId}/resale-data`,
    setResalePrice: `${EnvironmentUrls.economyApi}/v1/assets/{assetId}/resellable-copies/{userAssetId}`,
    getOwnedResaleCopies: `${EnvironmentUrls.economyApi}/v1/assets/{assetId}/users/{userId}/resale-copies`,
    getCanTradeWith: `${EnvironmentUrls.tradesApi}/v1/users/{userId}/can-trade-with`,
    postItemDetails: `${EnvironmentUrls.catalogApi}/v1/catalog/items/details`,
    postMarketplaceItemDetails: `${EnvironmentUrls.apiGatewayUrl}/marketplace-items/v1/items/details`,
    getResellersForLimited2Item: `${EnvironmentUrls.apiGatewayUrl}/marketplace-sales/v1/item/{collectibleItemId}/resellers`,
    placeLimited2ItemOnSale: `${EnvironmentUrls.apiGatewayUrl}/marketplace-sales/v1/item/{collectibleItemId}/instance/{collectibleInstanceId}/resale`,
    getResaleDataForLimited2Item: `${EnvironmentUrls.apiGatewayUrl}/marketplace-sales/v1/item/{collectibleItemId}/resale-data`
  },

  fetchTradePermissionsBatchSize: 5,
  resaleChartDayOptions: [30, 90, 180],

  errorBannerTimeout: 5000,

  translationKeys: {
    notAvailable: 'Label.NotAvailable',
    putForSaleFailure: 'Message.PutForSaleFailure',
    takeOffSaleFailure: 'Message.TakeOffSaleFailure'
  },

  eventStream: {
    context: {
      resellersList: 'resellersList'
    },
    name: {
      buyBtn: 'buyBtn',
      tradeBtn: 'tradeBtn',
      upgradeBtn: 'upgradeBtn',
      nonPremiumTradeBtn: 'nonPremiumTradeBtn'
    }
  },

  highCharts: {
    marginLeft: 50,
    lineChartHeight: 130,
    verticalBarChartHeight: 50,
    itemDelimiter: ',',
    lineDelimiter: '|',
    colors: {
      backgroundColor: 'transparent',
      lineColor: '#02b757',
      verticalBarColor: '#b8b8b8',
      borderColor: '#757575',
      pointColor: '#fff'
    }
  },

  resellersTabs: {
    priceChart: 'priceChart',
    resellers: 'resellers',
    inventory: 'inventory'
  },

  errorCodes: {
    internal: {
      unknown: 0
    },
    economyApi: {
      priceTooLow: 6,
      priceTooHigh: 7,
      unowned: 8
    }
  }
};

resellersConstants.highCharts.defaultConfiguration = {
  chart: {
    backgroundColor: resellersConstants.highCharts.colors.backgroundColor,
    marginLeft: resellersConstants.highCharts.marginLeft
  },
  title: {
    text: ''
  },
  legend: {
    enabled: false
  },
  tooltip: {
    backgroundColor: resellersConstants.highCharts.colors.borderColor,
    borderColor: resellersConstants.highCharts.colors.borderColor,
    pointFormat: `<span style="color:${resellersConstants.highCharts.colors.pointColor}">{point.y}</span>`,
    headerFormat: ''
  },
  xAxis: {
    type: 'datetime',
    max: new Date().getTime(),
    tickLength: 0
  },
  credits: {
    enabled: false
  }
};

resellersModule.constant('resellersConstants', resellersConstants);
export default resellersConstants;
