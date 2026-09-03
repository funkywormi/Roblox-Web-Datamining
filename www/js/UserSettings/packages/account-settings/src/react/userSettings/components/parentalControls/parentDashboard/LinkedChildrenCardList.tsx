import React from "react";
import { useTranslation } from "react-utilities";
import { useGetChildrenInfoQuery } from "../../../../apis/parentalControlsApi";
import LinkedChildCard from "./LinkedChildCard";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

export const LinkedChildrenCardList = (): JSX.Element => {
  const { translate } = useTranslation();

  const { data: childrenInfo } = useGetChildrenInfoQuery();

  const getLinkedChildrenListItems = (): JSX.Element | undefined => {
    const listItems = childrenInfo?.childrenInfoList.map(childInfo => {
      return <LinkedChildCard key={childInfo.userId} childInfo={childInfo} isMultiChildView />;
    });

    return <React.Fragment>{listItems}</React.Fragment>;
  };

  return (
    <React.Fragment>
      <div className="text container-header">
        {translate(parentalControlsTranslationConstants.linkedTo.numberChildrenAccountsLinked, {
          numChildAccounts: childrenInfo?.childrenInfoList.length,
        })}
      </div>
      {getLinkedChildrenListItems()}
    </React.Fragment>
  );
};

export default LinkedChildrenCardList;
