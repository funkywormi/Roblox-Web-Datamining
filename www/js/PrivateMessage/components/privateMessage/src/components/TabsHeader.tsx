import { Badge, Tabs, TabsList, TabsTrigger } from "@rbx/foundation-ui";
import type { MessageTab } from "../types";

const TabsHeader = ({
  activeTab,
  tabs,
  onSelectTab,
}: {
  activeTab: MessageTab;
  tabs: { name: MessageTab; label: string; count?: number }[];
  onSelectTab: (tab: MessageTab) => void;
}): React.ReactElement => (
  <Tabs
    value={activeTab}
    variant="Contained"
    size="Large"
    fitBehavior="Fill"
    className="radius-none overflow-hidden"
    onValueChange={value => {
      const tab = tabs.find(item => item.name === value);
      if (tab) {
        onSelectTab(tab.name);
      }
    }}
  >
    <TabsList>
      {tabs.map(tab => (
        <TabsTrigger key={tab.name} value={tab.name}>
          <span className="flex items-center justify-center gap-small">
            <span>{tab.label}</span>
            {tab.count ? <Badge label={String(tab.count)} variant="Contrast" /> : null}
          </span>
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

export default TabsHeader;
