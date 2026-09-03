import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import bedev1Services from "../../common/services/bedev1Services";
import bedev2Services from "../../common/services/bedev2Services";
import { TServerListMetadata } from "../hooks/useServerListMetadata";
import { getShouldPreopenCreateVip } from "./urlParsingUtils";

const fetchServerListMetadata = async (
  universeId: number | undefined,
): Promise<TServerListMetadata | undefined> => {
  if (!universeId) {
    return Promise.reject(new Error("Universe ID is required"));
  }

  try {
    // First fetches based on universeId (getPrivateServerSettings will retrieve the placeId for next fetches)
    const playabilityStatusPromise = bedev1Services.getPlayabilityStatus(universeId.toString());

    const privateServerSettings = await bedev2Services.getPrivateServerSettings(universeId);

    if (!privateServerSettings) {
      // TOOD: old, migrated code
      // eslint-disable-next-line @typescript-eslint/return-await
      return Promise.reject(new Error("Private server settings is undefined"));
    }

    const placeId = privateServerSettings.rootPlaceId;

    const placeDetailsPromise = bedev1Services.getPlaceDetails(placeId.toString());

    // If the canUserManagePlace fetch fails, we will default to false (non-blocking)
    const canUserManagePlacePromise = bedev2Services
      .getCanUserManagePlace(placeId, authenticatedUser()!.id!.toString())
      .catch(() => false);

    const [placeDetails, canUserManagePlace, playabilityStatus] = await Promise.all([
      placeDetailsPromise,
      canUserManagePlacePromise,
      playabilityStatusPromise,
    ]);

    if (!placeDetails || !playabilityStatus) {
      // TOOD: old, migrated code
      // eslint-disable-next-line @typescript-eslint/return-await
      return Promise.reject(new Error("Place details or playability status is undefined"));
    }

    const canCreateServer =
      privateServerSettings.privateServerData.isAvailable && playabilityStatus.isPlayable;

    const preopenCreatePrivateGame = getShouldPreopenCreateVip(window.location.pathname);

    return {
      canCreateServer,
      placeId: placeDetails.placeId,
      placeName: placeDetails.name,
      price: privateServerSettings.privateServerData.price,
      privateServerProductId: privateServerSettings.privateServerData.privateServerProductId,
      privateServerLimit: privateServerSettings.privateServerData.privateServerLimit,
      sellerId: placeDetails.builderId,
      sellerName: placeDetails.builder,
      universeId,
      userCanManagePlace: canUserManagePlace,
      preopenCreatePrivateGame,
      discounts: privateServerSettings.privateServerData.discounts ?? [],
    };
  } catch (error) {
    return Promise.reject(error);
  }
};

export default fetchServerListMetadata;
