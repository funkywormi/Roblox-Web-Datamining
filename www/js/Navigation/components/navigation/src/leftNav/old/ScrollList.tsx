import React, { useState, useCallback } from "react";
import environmentUrls from "@rbx/environment-urls";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { useTranslations } from "@rbx/www-common/i18n";
import { SimpleModal } from "@rbx/core-ui";
import links from "../../constants/linkConstants";
import layoutConstants from "../../constants/layoutConstants";
import LeftNavItem from "./LeftNavItem";
import { sendClickEvent } from "../../util/navigationUtil";

const { shopEvents } = layoutConstants;

export default function ScrollList(props: {
  friendsData: { count?: number };
  messagesData: { count?: number };
  tradeData: { count: number };
}) {
  const tShop = useTranslations("Feature.ShopDialog");
  const tSubscription = useTranslations("Feature.RobloxSubscription");
  const [isShopModalOpen, setShopModalOpen] = useState(false);

  const onClickShopLink = useCallback(() => {
    setShopModalOpen(isOpen => !isOpen);
    sendClickEvent(shopEvents.clickMerchandise);
  }, []);

  const closeShopModel = () => {
    setShopModalOpen(false);
  };

  const goToAmazonStop = () => {
    const decodedUrl = decodeURIComponent(environmentUrls.amazonWebStoreLink);
    window.open(decodedUrl, "_blank");
    sendClickEvent(shopEvents.goToAmazonStore);
  };

  const listNavItems = Object.values(links.scrollListItems).map(item => (
    <LeftNavItem key={item.name} {...{ onClickShopLink, ...item, ...props }} />
  ));

  const upgradeBtn = (
    <li className="rbx-upgrade-now">
      <a
        href={getAbsoluteUrl("/plus")}
        className="btn-growth-md btn-secondary-md"
        id="upgrade-now-button"
      >
        {tSubscription("Label.Blackbird")}
      </a>
    </li>
  );

  const modalBody = (
    <React.Fragment>
      <p className="shop-description">{tShop("Description.RetailWebsiteRedirect")}</p>
      <p className="shop-warning">{tShop("Description.PurchaseAgeWarning")}</p>
    </React.Fragment>
  );
  const shopModal = (
    <SimpleModal
      title={tShop("Heading.LeavingRoblox")}
      body={modalBody}
      show={isShopModalOpen}
      actionButtonShow
      actionButtonText={tShop("Action.Continue")}
      neutralButtonText={tShop("Action.Cancel")}
      onAction={goToAmazonStop}
      onNeutral={closeShopModel}
      onClose={closeShopModel}
    />
  );

  return (
    <ul className="left-col-list">
      {listNavItems}
      {upgradeBtn}
      {shopModal}
    </ul>
  );
}
