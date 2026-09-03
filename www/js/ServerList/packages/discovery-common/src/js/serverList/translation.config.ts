const translationConfig = {
  serverList: {
    common: [
      "CommonUI.Controls",
      "Feature.PrivateServers",
      "CommonUI.Messages",
      "Purchasing.PurchaseDialog",
      "Feature.RobloxSubscription",
    ],
    feature: "Feature.ServerList",
  },
  privateServer: {
    common: [] as string[],
    feature: "Feature.PrivateServers",
  },
  purchaseDialog: {
    common: [] as string[],
    feature: "Purchasing.PurchaseDialog",
  },
  vipServersResources: {
    common: ["IAPExperience.PurchaseError", "Feature.NotApproved", "Purchasing.PurchaseDialog"],
    feature: "Feature.VIPServer",
  },
};

export default translationConfig;
