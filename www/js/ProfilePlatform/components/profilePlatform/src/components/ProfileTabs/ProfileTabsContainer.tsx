import { Fragment, ReactElement, useMemo } from "react";
import { useTranslation } from "@rbx/core-scripts/legacy/react-utilities";
import { Component } from "@rbx/profile-platform";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import useComponentsFromJson from "../../hooks/useComponentsFromJson";
import ProfileTabs from "./ProfileTabs";

const PROFILE_TABS_CONFIGURATION = [
  {
    id: "about",
    labelKey: "Heading.AboutTab",
    components: new Set([
      Component.About,
      Component.CurrentlyWearing,
      Component.Store,
      Component.Friends,
      Component.Collections,
      Component.Communities,
      Component.FavoriteExperiences,
      Component.RobloxBadges,
      Component.PlayerBadges,
      Component.TrustedFriendModal,
    ]),
  },
  {
    id: "creations",
    labelKey: "Label.Creations",
    components: new Set([Component.Experiences]),
  },
];

const ProfileTabsContainer = () => {
  const { profileData } = useProfilePlatformContext();
  const componentsFromJson = useComponentsFromJson();
  const { translate } = useTranslation();

  const tabbedContent = useMemo(() => {
    const componentOrdering = profileData?.componentOrdering ?? [];

    const content: Record<string, ReactElement[]> = {};
    for (const tab of PROFILE_TABS_CONFIGURATION) {
      const tabComponents: ReactElement[] = [];
      for (const component of componentOrdering) {
        if (tab.components.has(component)) {
          tabComponents.push(<Fragment key={component}>{componentsFromJson[component]}</Fragment>);
        }
      }

      // Manually re-add Experiences component because the profile-platform-api response has [diverged](https://github.rbx.com/Roblox/profile/pull/856)
      if (tab.id === "creations" && !componentOrdering.includes(Component.Experiences)) {
        const experiencesComponent = componentsFromJson[Component.Experiences];
        if (experiencesComponent) {
          tabComponents.push(
            <Fragment key={Component.Experiences}>{experiencesComponent}</Fragment>,
          );
        }
      }

      content[tab.id] = tabComponents;
    }
    return content;
  }, [profileData, componentsFromJson]);

  const tabsWithContent = useMemo(() => {
    const tabs = [];
    for (const tab of PROFILE_TABS_CONFIGURATION) {
      tabs.push({
        id: tab.id,
        label: translate(tab.labelKey),
        content: tabbedContent[tab.id] ?? [],
      });
    }
    return tabs;
  }, [tabbedContent, translate]);

  return <ProfileTabs tabs={tabsWithContent} />;
};

export default ProfileTabsContainer;
