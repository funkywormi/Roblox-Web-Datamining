/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useRef, useEffect, useState, useCallback } from "react";
import classNames from "classnames";
import { Icon } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { getTabLabel } from "../../types/avatarTab.types";
import { useAvatarTabsContext } from "../../contexts/AvatarTabsContext";
import TabScrollButton, { TabScrollDirection } from "./TabScrollButton";

const AvatarEditorTabs: React.FC = () => {
  const { translate } = useTranslation();
  const {
    tabs,
    selectedTab,
    selectedSubcategory,
    selectedCategoryRow,
    clickedTab,
    hoveredTab,
    onTabClick,
    onTabBlur,
    onTabHover,
    mouseLeftTabMenu,
    onRowClick,
    onSubcategoryClick,
  } = useAvatarTabsContext();

  const tabContainerRef = useRef<HTMLDivElement>(null);
  const focusedTabRef = useRef<HTMLLIElement | null>(null);
  const tabListRef = useRef<HTMLUListElement>(null);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const getTabId = (label: string) => label.toLowerCase().replace(/\s+/g, "-");

  const tabWithOpenMenu = clickedTab || hoveredTab;

  // Show/hide the scroll arrows based on the tab list's current scroll position.
  const updateScrollAffordances = useCallback(() => {
    const el = tabListRef.current;
    if (!el) {
      return;
    }
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollPrev(el.scrollLeft > 1);
    setCanScrollNext(el.scrollLeft < maxScrollLeft - 1);
  }, []);

  const scrollTabs = useCallback((direction: TabScrollDirection) => {
    const el = tabListRef.current;
    if (!el) {
      return;
    }
    // Scroll by roughly a tab-and-a-half so a partially hidden tab comes fully into view.
    const amount = Math.max(el.clientWidth * 0.6, 134);
    el.scrollBy({ left: direction === "next" ? amount : -amount, behavior: "smooth" });
  }, []);

  // Recompute scroll affordances when the set of tabs changes or the window resizes.
  useEffect(() => {
    updateScrollAffordances();
    const handleResize = () => {
      updateScrollAffordances();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [updateScrollAffordances, tabs]);

  // Handle focus management
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      const tabElement = target.closest<HTMLLIElement>("li.rbx-tab");

      if (tabElement && tabContainerRef.current?.contains(tabElement)) {
        focusedTabRef.current = tabElement;
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      const tabElement = target.closest("li.rbx-tab")!;

      if (tabElement && focusedTabRef.current === tabElement) {
        // Check if the new focus target is still within the tab container
        const relatedTarget = event.relatedTarget as HTMLElement;

        if (!relatedTarget || !tabContainerRef.current?.contains(relatedTarget)) {
          // Focus has moved outside the tab container
          focusedTabRef.current = null;
          onTabBlur();
        }
      }
    };

    const container = tabContainerRef.current;
    if (container) {
      container.addEventListener("focusin", handleFocusIn);
      container.addEventListener("focusout", handleFocusOut);
    }

    return () => {
      if (container) {
        container.removeEventListener("focusin", handleFocusIn);
        container.removeEventListener("focusout", handleFocusOut);
      }
    };
  }, [onTabBlur]);

  return (
    <div ref={tabContainerRef} onMouseLeave={mouseLeftTabMenu} className="tab-wrapper">
      <div className="rbx-tabs-horizontal rbx-tabs-horizontal-seven-column avatar-tabs-scroller">
        {canScrollPrev && (
          <TabScrollButton
            direction="prev"
            onClick={() => {
              scrollTabs("prev");
            }}
          />
        )}
        <ul
          id="horizontal-tabs"
          className={classNames("nav nav-tabs", { "submenu-open": !!tabWithOpenMenu })}
          role="tablist"
          ref={tabListRef}
          onScroll={updateScrollAffordances}
        >
          {tabs.map(
            tab =>
              tab.visible !== false && (
                <li
                  key={tab.label}
                  className={classNames("rbx-tab", "seven-tab", {
                    active:
                      (clickedTab && tab === clickedTab) || (!clickedTab && tab === selectedTab),
                  })}
                >
                  <button
                    type="button"
                    onMouseOver={() => {
                      onTabHover(tab);
                    }}
                    onFocus={() => {
                      onTabHover(tab);
                    }}
                    onMouseDown={() => {
                      onTabClick(tab);
                    }}
                    className="rbx-tab-heading"
                    id={`${getTabId(tab.label)}-dropdown`}
                  >
                    <span className="text-lead">
                      {getTabLabel(tab, translate)}
                      {(!!tab.subCategoryMenu?.length || !!tab.categoryRows?.length) && (
                        <Icon
                          name="icon-regular-chevron-small-down"
                          size="Small"
                          className="icon-down"
                        />
                      )}
                    </span>
                  </button>
                </li>
              ),
          )}
        </ul>
        {canScrollNext && (
          <TabScrollButton
            direction="next"
            onClick={() => {
              scrollTabs("next");
            }}
          />
        )}
      </div>

      {/* Tab Submenu */}
      {!!tabWithOpenMenu && (
        <div className="tab-horizontal-submenu section-content seven-column">
          {/* For Nested Menus */}
          {tabWithOpenMenu.menuType === "Nested" &&
            tabWithOpenMenu.categoryRows &&
            tabWithOpenMenu.categoryRows.length > 0 &&
            tabWithOpenMenu.categoryRows.map(
              row =>
                row.visible !== false && (
                  <div key={row.title} className="submenu-row">
                    <li
                      className={classNames("text", "text-overflow", "text-label", {
                        active: row === selectedCategoryRow,
                      })}
                      onMouseDown={() => {
                        onRowClick(row, tabWithOpenMenu);
                      }}
                    >
                      {translate(row.title)}
                    </li>
                    <ul>
                      {row.subCategoryMenu.map(
                        menu =>
                          menu.visible !== false && (
                            <li
                              key={menu.label}
                              className={classNames("text", {
                                active: menu === selectedSubcategory,
                              })}
                              onMouseDown={() => {
                                onSubcategoryClick(menu, tabWithOpenMenu, row);
                              }}
                            >
                              {translate(menu.label)}
                            </li>
                          ),
                      )}
                    </ul>
                  </div>
                ),
            )}

          {/* For Non-Nested Menus */}
          {tabWithOpenMenu.menuType !== "Nested" && !!tabWithOpenMenu.subCategoryMenu?.length && (
            <ul>
              {tabWithOpenMenu.subCategoryMenu.map(
                menu =>
                  menu.visible !== false && (
                    <li
                      key={menu.label}
                      className={classNames("text", {
                        active: menu === selectedSubcategory,
                      })}
                      onMouseDown={() => {
                        onSubcategoryClick(menu, tabWithOpenMenu);
                      }}
                    >
                      {translate(menu.label)}
                    </li>
                  ),
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AvatarEditorTabs;
