import { useEffect, useRef, useState, type MouseEvent } from "react";
import classNames from "classnames";
import { window } from "@rbx/core-lib/browser";
import type { Category, Subcategory } from "../constants/types";
import { useItemsTranslate } from "../hooks/useItemsTranslate";
import { buildHashRoute, makeUrlFriendly, type HashRoute } from "../utils/hashRoute";

type CategoryMenuProps = {
  categories: Category[];
  currentCategory: Category | null;
  currentSubcategory: Subcategory | null;
};

export const SUBMENU_DELAY_MS = 1000;
export const SUBMENU_HIDE_DELAY_MS = 100;

export const categoryRoute = (category: Category): HashRoute => ({
  categoryName: makeUrlFriendly(category.name),
});

export const subcategoryRoute = (category: Category, subcategory: Subcategory): HashRoute => ({
  categoryName: makeUrlFriendly(category.name),
  subcategoryName: makeUrlFriendly(subcategory.name),
});

export const sortByDisplayName = (categories: readonly Category[]): Category[] =>
  categories.toSorted((a, b) => {
    const left = a.displayName.toLowerCase();
    const right = b.displayName.toLowerCase();
    if (left === right) {
      return 0;
    }
    return left < right ? -1 : 1;
  });

const CategoryMenu = ({ categories, currentCategory, currentSubcategory }: CategoryMenuProps) => {
  const translate = useItemsTranslate();
  const [openCategoryName, setOpenCategoryName] = useState<string | null>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const hoveredRef = useRef<string | null>(null);
  const currentXRef = useRef(0);
  const dirRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const schedule = (callback: () => void, delay: number) => {
    timersRef.current.push(setTimeout(callback, delay));
  };

  useEffect(() => {
    const timers = timersRef.current;
    const onBodyTouchStart = (event: TouchEvent) => {
      const menu = menuRef.current;
      if (!menu || !event.composedPath().includes(menu)) {
        setOpenCategoryName(null);
      }
    };
    window?.document.body.addEventListener("touchstart", onBodyTouchStart);
    return () => {
      window?.document.body.removeEventListener("touchstart", onBodyTouchStart);
      timers.forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, []);

  const onOptionHover = (category: Category) => {
    hoveredRef.current = category.name;
    if (dirRef.current === 1) {
      schedule(() => {
        setOpenCategoryName(hoveredRef.current);
      }, SUBMENU_DELAY_MS);
    } else {
      setOpenCategoryName(category.name);
    }
  };

  const onMenuMouseMove = (event: MouseEvent) => {
    const oldX = currentXRef.current;
    currentXRef.current = event.pageX;
    dirRef.current = oldX < currentXRef.current ? 1 : -1;
  };

  const onMenuMouseLeave = () => {
    schedule(() => {
      setOpenCategoryName(null);
    }, SUBMENU_HIDE_DELAY_MS);
    currentXRef.current = 0;
    dirRef.current = 0;
  };

  const onOptionLeave = () => {
    hoveredRef.current = null;
  };

  return (
    <div className="menu-vertical-container category-tabs">
      <h2>{translate("Heading.Category")}</h2>
      <ul
        id="vertical-menu"
        ref={menuRef}
        className="menu-vertical submenus"
        onMouseMove={onMenuMouseMove}
        onMouseLeave={onMenuMouseLeave}
      >
        {sortByDisplayName(categories).map(category => (
          <li
            key={category.name}
            className={classNames("menu-option", {
              active: currentCategory?.name === category.name,
            })}
            onMouseOver={() => {
              onOptionHover(category);
            }}
            onFocus={() => {
              onOptionHover(category);
            }}
            onTouchStart={() => {
              onOptionHover(category);
            }}
            onMouseOut={onOptionLeave}
            onBlur={onOptionLeave}
          >
            <a className="menu-option-content" href={buildHashRoute(categoryRoute(category))}>
              <span className="menu-text font-caption-header">{category.displayName}</span>
              {category.items.length > 1 && <span className="icon-right-16x16" />}
            </a>
            {category.items.length > 1 && (
              <div
                className="menu-secondary-container"
                style={openCategoryName === category.name ? { display: "block" } : undefined}
              >
                <ul className="menu-secondary">
                  {category.items.map(subcategory => (
                    <li
                      key={subcategory.name}
                      className={classNames("menu-secondary-option", {
                        active: currentSubcategory?.name === subcategory.name,
                      })}
                    >
                      <a
                        className="font-caption-header menu-text"
                        href={buildHashRoute(subcategoryRoute(category, subcategory))}
                      >
                        {subcategory.displayName}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryMenu;
