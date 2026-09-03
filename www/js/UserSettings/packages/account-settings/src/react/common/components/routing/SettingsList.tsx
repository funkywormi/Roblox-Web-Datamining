import React from "react";
import { NavLink, Route } from "react-router-dom";
import { TSettingsPage } from "../../../../types/commonTypes";
import SettingListItem from "./SettingListItem";
import SettingSubListItem from "./SettingSubListItem";
import SettingsSection from "../SettingsSection";
import useWrappedTranslation from "../../../userSettings/hooks/useWrappedTranslation";

interface SettingsListProps {
  subPages: Record<string, TSettingsPage>;
  routingPath?: string;
  description?: JSX.Element;
  isMainMenu?: boolean;
}

const SettingsList: React.FC<SettingsListProps> = ({
  subPages,
  routingPath,
  description,
  isMainMenu,
}) => {
  const { translate } = useWrappedTranslation();

  const renderNavLink = ({
    path,
    titleTranslationKey,
    currentValueComponent,
    disabled,
    name,
  }: TSettingsPage): JSX.Element => (
    <NavLink key={path} to={path}>
      {isMainMenu ? (
        <SettingListItem
          id={`setting-list-${name}`}
          title={titleTranslationKey ? translate(titleTranslationKey) : ""}
          currentSettingValueComponent={currentValueComponent}
          showArrow
        />
      ) : (
        <SettingSubListItem
          id={`setting-sub-list-${name}`}
          title={titleTranslationKey ? translate(titleTranslationKey) : ""}
          currentSettingValueComponent={currentValueComponent}
          showArrow
          disabled={disabled}
        />
      )}
      {!isMainMenu && <div className="rbx-divider" />}
    </NavLink>
  );

  const navigation = <nav>{Object.values(subPages).map(renderNavLink)}</nav>;

  return routingPath ? (
    <Route exact path={routingPath}>
      {description && <SettingsSection description={description} />}
      {navigation}
    </Route>
  ) : (
    navigation
  );
};

export default SettingsList;
