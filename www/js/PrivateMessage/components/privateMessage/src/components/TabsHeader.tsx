import { Badge, Tabs, TabsContent, TabsList, TabsTrigger } from "@rbx/foundation-ui";
import type { MessageTab } from "../types";

const TabsHeader = ({
  activeTab,
  tabs,
  onSelectTab,
  children,
}: {
  activeTab: MessageTab;
  tabs: { name: MessageTab; label: string; count?: number }[];
  onSelectTab: (tab: MessageTab) => void;
  // Rendered as the active tab's panel, so each trigger's aria-controls points at it.
  children: React.ReactNode;
}): React.ReactElement => (
  <Tabs
    value={activeTab}
    variant="Contained"
    size="Large"
    fitBehavior="Fill"
    onValueChange={value => {
      const tab = tabs.find(item => item.name === value);
      if (tab) {
        onSelectTab(tab.name);
      }
    }}
  >
    <TabsList className="radius-none overflow-hidden">
      {tabs.map(tab => (
        <TabsTrigger key={tab.name} value={tab.name}>
          <span className="flex items-center justify-center gap-small">
            <span>{tab.label}</span>
            {tab.count ? <Badge label={String(tab.count)} variant="Contrast" /> : null}
          </span>
        </TabsTrigger>
      ))}
    </TabsList>
    {/* TabsContent adds padding-top-large; MessageActions already spaces itself. */}
    <TabsContent value={activeTab} style={{ paddingTop: 0 }}>
      {children}
    </TabsContent>
  </Tabs>
);

export default TabsHeader;
