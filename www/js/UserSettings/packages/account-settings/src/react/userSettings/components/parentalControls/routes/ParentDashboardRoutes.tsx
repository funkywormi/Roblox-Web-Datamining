import React from "react";
import { useAppSelector } from "../../../../redux/hooks";
import { selectChildPagesMap } from "../../../../apis/slices/childPagesSlice";
import { useGetChildrenInfoQuery } from "../../../../apis/parentalControlsApi";
import ChildRoutes from "./ChildRoutes";

// Defines routes for parents to view and manage the details and settings of their children
export const ParentDashboardRoutes = (): JSX.Element => {
  const { data: childrenInfo } = useGetChildrenInfoQuery();
  const childPagesMap = useAppSelector(selectChildPagesMap);

  return (
    <React.Fragment>
      {childPagesMap &&
        childrenInfo?.childrenInfoList.map(child => {
          const childPages = childPagesMap[child.userId];
          if (!childPages) return null;
          return <ChildRoutes key={child.userId} child={child} childPages={childPages} />;
        })}
    </React.Fragment>
  );
};

export default ParentDashboardRoutes;
