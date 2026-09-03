interface GameDetailMetaData {
  gameDetailUniverseId: number;
  gameDetailPlaceName: string | null;
  gameDetailPlaceId: number;
  gameDetailPageId: string | null;
  gameDetailGameInstanceId: string | null;
  gameDetailShowShutdownAllButton: boolean;
  gameDetailUserCanManagePlace: boolean;
  gameDetailPrivateServerPrice: number;
  gameDetailCanCreateServer: boolean;
  gameDetailPrivateServerLimit: number;
  gameDetailSellerName: string | null;
  gameDetailSellerId: number;
  gameDetailPrivateServerProductId: number;
  gameDetailPreopenCreatePrivateServerModal: boolean;
  gameDetailExperienceInviteLinkId: string | null;
  gameDetailExperienceInviteStatus: string | null;
}

const getCurrentGameMetaData = (): GameDetailMetaData | null => {
  const gameDetailMetaElement = document.getElementById("game-detail-meta-data");
  if (gameDetailMetaElement) {
    return {
      gameDetailUniverseId: parseInt(
        gameDetailMetaElement.getAttribute("data-universe-id") ?? "",
        10,
      ),
      gameDetailPlaceName: gameDetailMetaElement.getAttribute("data-place-name"),
      gameDetailPlaceId: parseInt(gameDetailMetaElement.getAttribute("data-place-id") ?? "", 10),
      gameDetailPageId: gameDetailMetaElement.getAttribute("data-page-id"),
      gameDetailGameInstanceId: gameDetailMetaElement.getAttribute("data-game-instance-id"),
      gameDetailShowShutdownAllButton:
        gameDetailMetaElement.getAttribute("data-show-shut-down-all-button") === "True",
      gameDetailUserCanManagePlace:
        gameDetailMetaElement.getAttribute("data-user-can-manage-place") === "True",
      gameDetailPrivateServerPrice: parseInt(
        gameDetailMetaElement.getAttribute("data-private-server-price") ?? "",
        10,
      ),
      gameDetailCanCreateServer:
        gameDetailMetaElement.getAttribute("data-can-create-server") === "True",
      gameDetailPrivateServerLimit:
        parseInt(gameDetailMetaElement.getAttribute("data-private-server-limit") ?? "", 10) || 0,
      gameDetailSellerName: gameDetailMetaElement.getAttribute("data-seller-name"),
      gameDetailSellerId: parseInt(gameDetailMetaElement.getAttribute("data-seller-id") ?? "", 10),
      gameDetailPrivateServerProductId: parseInt(
        gameDetailMetaElement.getAttribute("data-private-server-product-id") ?? "",
        10,
      ),
      gameDetailPreopenCreatePrivateServerModal:
        gameDetailMetaElement.getAttribute("data-preopen-create-private-server-modal") === "True",
      gameDetailExperienceInviteLinkId: gameDetailMetaElement.getAttribute(
        "data-experience-invite-link-id",
      ),
      gameDetailExperienceInviteStatus: gameDetailMetaElement.getAttribute(
        "data-experience-invite-status",
      ),
    };
  }
  return null;
};

export default {
  getCurrentGameMetaData,
};
