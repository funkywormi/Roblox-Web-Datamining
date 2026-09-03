import { JSX } from "react";
import { NavLink } from "react-router-dom";
import { SettingListItem, type TSettingsPage } from "@rbx/user-settings";
import { useTranslation } from "@rbx/core-scripts/react";

type PageListProps = {
  pages: TSettingsPage[];
};

export const PageList = ({ pages }: PageListProps): JSX.Element => {
  const { translate } = useTranslation();

  return (
    <nav>
      {pages
        .toSorted((a, b) => (a.name > b.name ? 1 : -1))
        .map(page => (
          <NavLink key={page.name} to={page.path}>
            <SettingListItem
              id={page.path}
              title={translate(page.titleTranslationKey ?? "")}
              description={translate(page.descriptionTranslationKey ?? "")}
              showArrow
            />
          </NavLink>
        ))}
    </nav>
  );
};

export default PageList;
