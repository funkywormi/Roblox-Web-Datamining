import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import AvatarAccoutrementService from "../utils/avatarAccoutrementService";
import { Tab, SubCategoryMenu, CategoryRow } from "../types";
import { CatalogSettings } from "../catalogMetadataRequest";
import avatarEditorTabs from "../utils/avatarTab.constants";

interface AvatarTabsContextType {
  tabs: Tab[];
  selectedTab: Tab | undefined;
  selectedSubcategory: SubCategoryMenu | null | undefined;
  selectedCategoryRow: CategoryRow | null | undefined;
  showAdvancedAccessoriesLink: boolean;
  clickedTab: Tab | null | undefined;
  hoveredTab: Tab | null | undefined;
  initializeTabs: (catalogMetaData: CatalogSettings) => void;
  onRowClick: (row: CategoryRow, tab: Tab) => void;
  onSubcategoryClick: (subcategory: SubCategoryMenu, tab: Tab, row?: CategoryRow) => void;
  onTabClick: (tab: Tab) => void;
  onTabBlur: () => void;
  onTabHover: (tab: Tab) => void;
  mouseLeftTabMenu: () => void;
}

const AvatarTabsContext = createContext<AvatarTabsContextType | undefined>(undefined);

interface AvatarTabsProviderProps {
  children: ReactNode;
}

export type TabSelectionData = {
  selectedTab: Tab | undefined;
  selectedSubcategory: SubCategoryMenu | undefined;
  selectedCategoryRow: CategoryRow | undefined;
  hoveredTab: Tab | undefined;
  clickedTab: Tab | undefined;
};

export function AvatarTabsProvider({ children }: AvatarTabsProviderProps): JSX.Element {
  // All of the available tabs
  const [tabs, setTabs] = useState<Tab[]>(avatarEditorTabs);

  const [tabSelectionData, setTabSelectionData] = useState<TabSelectionData>({
    selectedTab: undefined,
    selectedSubcategory: undefined,
    selectedCategoryRow: undefined,
    hoveredTab: undefined,
    clickedTab: undefined,
  });
  const { selectedTab, selectedSubcategory, selectedCategoryRow, hoveredTab, clickedTab } =
    tabSelectionData;

  const selectOption = useCallback(
    (tab: Tab, menu: SubCategoryMenu | undefined, categoryRow?: CategoryRow) => {
      setTabSelectionData(prev => ({
        ...prev,
        selectedTab: tab,
        selectedSubcategory: menu,
        selectedCategoryRow: categoryRow,
        hoveredTab: undefined,
        clickedTab: undefined,
      }));
    },
    [],
  );

  const initializeTabs = useCallback(
    (catalogMetaData: CatalogSettings) => {
      const tabsToUse = avatarEditorTabs;
      setTabs(tabsToUse);

      const initialTab = tabsToUse[0]!;

      const menu = initialTab.subCategoryMenu
        ? initialTab.subCategoryMenu[0]
        : initialTab?.categoryRows?.[0]?.subCategoryMenu[0];
      selectOption(initialTab, menu);
    },
    [selectOption],
  );

  const [showAdvancedAccessoriesLink, setShowAdvancedAccessoriesLink] = useState<boolean>(true);

  useEffect(() => {
    setShowAdvancedAccessoriesLink(
      !!(
        selectedSubcategory?.assetType &&
        AvatarAccoutrementService.isAccessoryType(selectedSubcategory.assetType)
      ),
    );
  }, [tabSelectionData]);

  const onTabClick = useCallback(
    (tab: Tab) => {
      if (tab.noSubCategoryMenu) {
        // The user has clicked on a tab with no subcategory menu, so just select that tab
        selectOption(tab, undefined);
      } else {
        // The user has clicked on a tab with a subcategory menu, so we should
        // open the submenu and keep it open until the user clicks on something else

        // If this tab is already showing a subcategory menu in the locked state, then close it
        if (clickedTab && clickedTab === tab) {
          setTabSelectionData(prev => ({
            ...prev,
            clickedTab: undefined,
          }));
          return;
        }

        // If another tab is already in the locked state, then close it and open this one instead
        if (clickedTab && clickedTab !== tab) {
          setTabSelectionData(prev => ({
            ...prev,
            clickedTab: tab,
          }));
          return;
        }

        // Otherwise, show this tab subcategory in a locked state
        setTabSelectionData(prev => ({
          ...prev,
          clickedTab: tab,
        }));
      }
    },
    [clickedTab, selectOption],
  );

  const onTabBlur = useCallback(() => {
    setTabSelectionData(prev => ({
      ...prev,
      clickedTab: undefined,
    }));
  }, []);

  const onTabHover = useCallback((tab: Tab) => {
    // Only open the submenu dropdown for tabs that actually have one. Tabs
    // without a submenu (e.g. Backgrounds) should just be clickable.
    const hasSubmenu = !!(tab.subCategoryMenu?.length || tab.categoryRows?.length);
    setTabSelectionData(prev => ({
      ...prev,
      hoveredTab: hasSubmenu ? tab : undefined,
    }));
  }, []);

  const mouseLeftTabMenu = useCallback(() => {
    setTabSelectionData(prev => ({
      ...prev,
      hoveredTab: undefined,
    }));
  }, []);

  const onRowClick = useCallback(
    (row: CategoryRow, tab: Tab) => {
      selectOption(tab, undefined, row);
    },
    [selectOption],
  );

  const onSubcategoryClick = useCallback(
    (subcategory: SubCategoryMenu, tab: Tab, row?: CategoryRow) => {
      selectOption(tab, subcategory, row);
    },
    [selectOption],
  );

  const value = {
    tabs,
    selectedTab,
    selectedSubcategory,
    selectedCategoryRow,
    showAdvancedAccessoriesLink,
    clickedTab,
    hoveredTab,
    initializeTabs,
    onRowClick,
    onSubcategoryClick,
    onTabClick,
    onTabBlur,
    onTabHover,
    mouseLeftTabMenu,
  };

  return <AvatarTabsContext.Provider value={value}>{children}</AvatarTabsContext.Provider>;
}

export function useAvatarTabsContext(): AvatarTabsContextType {
  const context = useContext(AvatarTabsContext);
  if (context === undefined) {
    throw new Error("useAvatarTabsContext must be used within an AvatarTabsProvider");
  }
  return context;
}
