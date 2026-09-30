type TConfig = {
  common: string[];
  feature: string;
};

// resellersModule.js registers all six namespaces; `common` is where the extra ones go.
export const translationConfig: TConfig = {
  common: [
    "Feature.PrivateSales",
    "Feature.Item",
    "Feature.Profile",
    "Feature.Trades",
    "Feature.Premium",
  ],
  feature: "Feature.Catalog",
};

export default translationConfig;
