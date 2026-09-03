import { useTranslation } from "@rbx/core-scripts/react";
import { Component } from "@rbx/profile-platform";
import ProfileCarouselWithAnalytics from "../Common/ProfileCarouselWithAnalytics";
import { Group } from "../../services/groupsService";
import useRenderGroupItem from "../../hooks/useRenderGroupItem";

type CommunitiesProps = {
  groups: Group[];
};

const Communities = ({ groups }: CommunitiesProps) => {
  const { translate } = useTranslation();
  const { renderGroupItem, getItemId, onItemsImpressed, onItemClick } = useRenderGroupItem(groups);

  return (
    <div className="profile-communities">
      <ProfileCarouselWithAnalytics
        headerTitle={translate("Heading.Groups")}
        items={groups}
        onItemsImpressed={onItemsImpressed}
        onItemClick={onItemClick}
        getItemId={getItemId}
        renderItem={renderGroupItem}
        component={Component.Communities}
      />
    </div>
  );
};

export default Communities;
