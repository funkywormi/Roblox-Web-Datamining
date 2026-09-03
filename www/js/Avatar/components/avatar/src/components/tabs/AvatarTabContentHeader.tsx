import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { getTabLabel } from "../../types/avatarTab.types";
import { useAvatarTabsContext } from "../../contexts/AvatarTabsContext";
import { useAvatarPageContext } from "../../contexts/AvatarPageContext";

const CREATE_URL = "/develop?directLink=1&view=";

const AvatarTabContentHeader: React.FC = () => {
  const { translate } = useTranslation();
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
              <span className="icon-right-16x16" />
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
              <span className="icon-right-16x16" />
            </li>
            <li>{translate(selectedSubcategory.label)}</li>
          </React.Fragment>
        )}
      </ul>

      {/* Create button */}
      {selectedSubcategory && (
        <span>
          {shirtId && selectedSubcategory.name === "Shirts" && (
            <a
              className="btn-float-right btn-min-width btn-secondary-xs"
              href={`${CREATE_URL}${shirtId}`}
            >
              {translate("Action.Create")}
            </a>
          )}
          {pantsId && selectedSubcategory.name === "Pants" && (
            <a
              className="btn-float-right btn-min-width btn-secondary-xs"
              href={`${CREATE_URL}${pantsId}`}
            >
              {translate("Action.Create")}
            </a>
          )}
          {tShirtId && selectedSubcategory.name === "T-Shirts" && (
            <a
              className="btn-float-right btn-min-width btn-secondary-xs"
              href={`${CREATE_URL}${tShirtId}`}
            >
              {translate("Action.Create")}
            </a>
          )}
        </span>
      )}
    </div>
  );
};

export default AvatarTabContentHeader;
