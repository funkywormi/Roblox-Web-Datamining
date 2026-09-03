import { ReactElement, useCallback, useEffect, useState } from "react";

type ProfileTab = { id: string; label: string; content: ReactElement[] };

type ProfileTabsProps = {
  tabs: ProfileTab[];
};

const ProfileTabs = ({ tabs }: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  useEffect(() => {
    const { hash } = window.location;
    for (const tab of tabs) {
      if (hash.includes(tab.id)) {
        setActiveTab(tab.id);
        break;
      }
    }
  }, [tabs]);

  const renderTab = useCallback(
    (tab: ProfileTab) => {
      const { id, label } = tab;
      const onClickTab = () => {
        setActiveTab(id);
      };

      return (
        <li key={id} className="justify-center flex fill">
          <a
            id={`tab-${id}`}
            href={`#${id}`}
            className={`profile-tab ${activeTab === id ? "active" : ""} justify-center text-label-medium padding-bottom-xlarge padding-top-medium flex fill`}
            onClick={onClickTab}
          >
            {label}
          </a>
        </li>
      );
    },
    [activeTab],
  );

  return (
    <div>
      <ul className="profile-tabs flex">{tabs.map(tab => renderTab(tab))}</ul>
      {tabs.map(({ id, content }) => (
        <div
          className={`profile-tab-content ${activeTab !== id ? "hidden" : ""} padding-top-xxlarge`}
          key={id}
        >
          {content}
        </div>
      ))}
    </div>
  );
};

export default ProfileTabs;
