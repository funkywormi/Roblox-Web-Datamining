import React from "react";
import { Button, Icon } from "@rbx/foundation-ui";
import { useAvatarTranslate } from "../../utils/translate";
import { getTabLabel } from "../../types/avatarTab.types";
import { useAvatarTabsContext } from "../../contexts/AvatarTabsContext";
import { useAvatarPageContext } from "../../contexts/AvatarPageContext";

const CREATE_URL = "/develop?directLink=1&view=";

const AvatarTabContentHeader: React.FC = () => {
  const translate = useAvatarTranslate("Feature.Avatar");
  const { selectedTab, selectedCategoryRow, selectedSubcategory, onRowClick } =
    useAvatarTabsContext();

  const { shirtId, pantsId, tShirtId } = useAvatarPageContext();

  return (
    <div>
      {/* Breadcrumb */}
      <ul className="breadcrumb-container">
        {selectedTab && <li> {getTabLabel(selectedTab, translate)}</li>}
        {selectedCategoryRow && selectedTab && (
          <React.Fragment>
            <li>
              <Icon name="icon-regular-chevron-small-right" size="Small" />
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  onRowClick(selectedCategoryRow, selectedTab);
                }}
                style={{ background: "none", border: "none" }}
              >
                {translate(selectedCategoryRow.title)}
              </button>
            </li>
          </React.Fragment>
        )}
        {selectedSubcategory && (
          <React.Fragment>
            <li>
              <Icon name="icon-regular-chevron-small-right" size="Small" />
            </li>
            <li>{translate(selectedSubcategory.label)}</li>
          </React.Fragment>
        )}
      </ul>

      {/* Create button */}
      {selectedSubcategory && (
        <span>
          {shirtId && selectedSubcategory.name === "Shirts" && (
            <Button
              as="a"
              variant="Standard"
              size="XSmall"
              className="btn-float-right"
              href={`${CREATE_URL}${shirtId}`}
            >
              {translate("Action.Create")}
            </Button>
          )}
          {pantsId && selectedSubcategory.name === "Pants" && (
            <Button
              as="a"
              variant="Standard"
              size="XSmall"
              className="btn-float-right"
              href={`${CREATE_URL}${pantsId}`}
            >
              {translate("Action.Create")}
            </Button>
          )}
          {tShirtId && selectedSubcategory.name === "T-Shirts" && (
            <Button
              as="a"
              variant="Standard"
              size="XSmall"
              className="btn-float-right"
              href={`${CREATE_URL}${tShirtId}`}
            >
              {translate("Action.Create")}
            </Button>
          )}
        </span>
      )}
    </div>
  );
};

export default AvatarTabContentHeader;
