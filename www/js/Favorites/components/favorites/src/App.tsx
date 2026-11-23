import { useMemo } from "react";
import { useTranslations } from "@rbx/www-common/i18n";
import FavoritesPage from "@rbx/user-items/favorites";
import {
  createItemsTranslate,
  ItemsTranslateProvider,
  type NamespaceTranslator,
} from "@rbx/user-items/translate";

const App = ({ canViewInventory }: { canViewInventory: string | undefined }) => {
  const inventory = useTranslations("Feature.Inventory");
  const favorites = useTranslations("Feature.Favorites");
  const catalog = useTranslations("Feature.Catalog");
  const assetTypes = useTranslations("Common.AssetTypes");
  const controls = useTranslations("CommonUI.Controls");
  const translate = useMemo(
    () =>
      createItemsTranslate(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        [inventory, favorites, catalog, assetTypes, controls] as unknown as NamespaceTranslator[],
      ),
    [inventory, favorites, catalog, assetTypes, controls],
  );

  return (
    <ItemsTranslateProvider value={translate}>
      <FavoritesPage canViewInventory={canViewInventory} />
    </ItemsTranslateProvider>
  );
};

export default App;
