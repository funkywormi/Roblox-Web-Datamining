import { useCallback, useMemo, useState } from "react";
import type { ElementType } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Button } from "@rbx/foundation-ui";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import useServerListMetadata from "../hooks/useServerListMetadata";
import useIsPlayerHostedEventsEnabled from "../hooks/useIsPlayerHostedEventsEnabled";
import serverListService from "../../../js/serverList/services/serverListService";
import serverListConstants from "../../../js/serverList/constants/serverListConstants";
// @ts-expect-error legacy JS module without type declarations
import RunningGameServers from "../../../js/serverList/containers/RunningGameServers";
import PrivateServersSection from "./v2/PrivateServersSection";
import CreatePlayerHostedEventRow from "./v2/CreatePlayerHostedEventRow";
import SubscriptionSheet from "./SubscriptionSheet";
import useSubscriptionProduct from "../hooks/useSubscriptionProduct";
import { PrivateServerUpsellEventsProvider } from "../hooks/usePrivateServerUpsellEvents";
import useCurrentTab from "../../../js/gameData/hooks/useCurrentTab";

const { serverListTypes, resources } = serverListConstants;
const { ASSET_TYPE_ENUM } = window.RobloxItemPurchase;

type MigrationServerListContainerProps = {
  sheetComponent?: ElementType;
};

const MigrationServerListContainer = ({
  sheetComponent: SheetComponent,
}: MigrationServerListContainerProps) => {
  const { translate } = useTranslation();
  const currentTab = useCurrentTab();
  const isWebview = currentTab == null;
  const { subscriptionProduct } = useSubscriptionProduct();
  const [sheetOpen, setSheetOpen] = useState(false);
  const deviceMeta = getDeviceMeta();

  const handleOpenSheet = useCallback(() => setSheetOpen(true), []);
  const redirectUrl = useMemo(() => window.location.href, []);
  const { serverListMetadata, isLoading, hasError, refetchServerListMetadata } =
    useServerListMetadata();
  const isAuthenticated = authenticatedUser?.isAuthenticated ?? false;

  const { isPlayerHostedEventsEnabled } = useIsPlayerHostedEventsEnabled(
    serverListMetadata?.universeId,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center padding-y-xxlarge">
        <span className="text-body-medium content-muted">{translate(resources.loadingText)}</span>
      </div>
    );
  }

  if (hasError || !serverListMetadata) {
    return (
      <div className="flex flex-col items-center gap-medium padding-y-xxlarge">
        <span className="text-body-medium content-muted">
          {translate(resources.serversFailedToLoadText)}
        </span>
        {refetchServerListMetadata && (
          <Button variant="Link" size="Small" onClick={() => refetchServerListMetadata()}>
            {translate(resources.privateServerRefreshText)}
          </Button>
        )}
      </div>
    );
  }

  return (
    <PrivateServerUpsellEventsProvider universeId={serverListMetadata.universeId}>
      <div className="flex flex-col padding-x-large width-full">
        <div className="margin-bottom-large">
          <PrivateServersSection
            serverListMetadata={serverListMetadata}
            isWebview={isWebview}
            onOpenSheet={SheetComponent ? handleOpenSheet : undefined}
          />
        </div>

        {isPlayerHostedEventsEnabled && (
          <CreatePlayerHostedEventRow universeId={serverListMetadata.universeId} />
        )}

        <RunningGameServers
          type={serverListTypes.friend.key}
          getGameServers={serverListService.getFriendsGameInstances}
          headerTitleResource={resources.friendsServersTitle}
          serverListMetadata={serverListMetadata}
          translate={undefined}
        />
        <RunningGameServers
          type={serverListTypes.public.key}
          getGameServers={serverListService.getPublicGameInstancesV2}
          headerTitleResource={resources.publicServersTitle}
          serverListMetadata={serverListMetadata}
          isAuthenticated={isAuthenticated}
          translate={undefined}
        />
      </div>

      {subscriptionProduct && deviceMeta && SheetComponent && (
        <SubscriptionSheet
          SheetComponent={SheetComponent}
          sheetOpen={sheetOpen}
          setSheetOpen={setSheetOpen}
          subscriptionProduct={subscriptionProduct}
          deviceMeta={deviceMeta}
          redirectUrl={redirectUrl}
          assetType={ASSET_TYPE_ENUM.PRIVATE_SERVER}
        />
      )}
    </PrivateServerUpsellEventsProvider>
  );
};

export default MigrationServerListContainer;
