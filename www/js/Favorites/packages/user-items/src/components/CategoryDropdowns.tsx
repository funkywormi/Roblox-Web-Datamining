import classNames from "classnames";
import { Dropdown, Menu, MenuItem, MenuSection } from "@rbx/foundation-ui";
import type { Category, Subcategory } from "../constants/types";
import { useItemsTranslate } from "../hooks/useItemsTranslate";
import { makeUrlFriendly, navigateToHashRoute } from "../utils/hashRoute";
import { categoryRoute, sortByDisplayName, subcategoryRoute } from "./CategoryMenu";

type CategoryDropdownsProps = {
  categories: Category[];
  currentCategory: Category | null;
  currentSubcategory: Subcategory | null;
};

const CategoryDropdowns = ({
  categories,
  currentCategory,
  currentSubcategory,
}: CategoryDropdownsProps) => {
  const translate = useItemsTranslate();
  const sortedCategories = sortByDisplayName(categories);
  const subcategories = currentCategory?.items ?? [];
  const hasSubcategories = subcategories.length > 1;

  return (
    <div className="category-dropdown">
      <h2>{translate("Heading.Category")}</h2>
      <Dropdown
        size="Medium"
        ariaLabel={translate("Heading.Category")}
        placeholder={currentCategory?.displayName ?? ""}
        value={currentCategory ? makeUrlFriendly(currentCategory.name) : undefined}
        onValueChange={value => {
          const category = sortedCategories.find(item => makeUrlFriendly(item.name) === value);
          if (category) {
            navigateToHashRoute(categoryRoute(category));
          }
        }}
      >
        <Menu>
          <MenuSection>
            {sortedCategories.map(category => (
              <MenuItem
                key={category.name}
                value={makeUrlFriendly(category.name)}
                title={category.displayName}
              />
            ))}
          </MenuSection>
        </Menu>
      </Dropdown>
      <div
        className={classNames({ "subcategory-dropdown": hasSubcategories })}
        hidden={!hasSubcategories}
      >
        <h2>{translate("Heading.Subcategory")}</h2>
        {currentCategory && hasSubcategories && (
          <Dropdown
            size="Medium"
            ariaLabel={translate("Heading.Subcategory")}
            placeholder={currentSubcategory?.displayName ?? ""}
            value={currentSubcategory ? makeUrlFriendly(currentSubcategory.name) : undefined}
            onValueChange={value => {
              const subcategory = subcategories.find(item => makeUrlFriendly(item.name) === value);
              if (subcategory) {
                navigateToHashRoute(subcategoryRoute(currentCategory, subcategory));
              }
            }}
          >
            <Menu>
              <MenuSection>
                {subcategories.map(subcategory => (
                  <MenuItem
                    key={subcategory.name}
                    value={makeUrlFriendly(subcategory.name)}
                    title={subcategory.displayName}
                  />
                ))}
              </MenuSection>
            </Menu>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default CategoryDropdowns;
