import { useMemo } from "react";
import { useTranslations } from "@rbx/www-common/i18n";
import InventoryPage from "@rbx/user-items/inventory";
import {
  createItemsTranslate,
  ItemsTranslateProvider,
  type NamespaceTranslator,
} from "@rbx/user-items/translate";

const App = ({ canViewInventory }: { canViewInventory: string | undefined }) => {
  const inventory = useTranslations("Feature.Inventory");
  const privateServers = useTranslations("Feature.PrivateServers");
  const recommendations = useTranslations("Feature.Recommendations");
  const catalog = useTranslations("Feature.Catalog");
  const assetTypes = useTranslations("Common.AssetTypes");
  const controls = useTranslations("CommonUI.Controls");
  const translate = useMemo(
    () =>
      createItemsTranslate(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        [
          inventory,
          privateServers,
          recommendations,
          catalog,
          assetTypes,
          controls,
        ] as unknown as NamespaceTranslator[],
      ),
    [inventory, privateServers, recommendations, catalog, assetTypes, controls],
  );

  return (
    <ItemsTranslateProvider value={translate}>
      <InventoryPage canViewInventory={canViewInventory} />
    </ItemsTranslateProvider>
  );
};

export default App;
