import { useCallback, useEffect, useState } from "react";
import { ThumbnailAvatarsSize } from "@rbx/thumbnails";
import { reportAXError } from "../utils/axAnalyticsService";
import AvatarAccoutrementService from "../utils/avatarAccoutrementService";
import { getThumbnailMetrics } from "../utils/thumbnailMetrics";
import useAvatarTypeService, { AvatarTypeService } from "./useAvatarTypeService";
import { AvatarConfigV2 } from "../avatarRequest";
import { PlayerAvatarConfig, WearableAssetType } from "../avatarRules";
import { CatalogSettings } from "../catalogMetadataRequest";
import avatarConstants from "../constants/avatarConstants";
import { AvatarType } from "../constants/types";
import { AvatarSettings, defaultSettings } from "../metadataRequest";
import AvatarAPIService, { AvatarInventoryItem } from "../services/avatarAPIService";
import { useSystemFeedback } from "../contexts/SystemFeedbackContext";
import { useAvatarTabsContext } from "../contexts/AvatarTabsContext";
import { useCurrentlyWearingAssetsStoreContext } from "../contexts/CurrentlyWearingAssetsStoreContext";
import parseError from "../utils/parseErrorUtil";

export type HeadShape = AvatarInventoryItem["headShape"];

interface ThumbnailOptions {
  size: string;
}

export type AvatarThumbnailSuccessCallbackPayload = {
  duration: number;
};

export interface AvatarThumbnailDataModel {
  thumbnailCacheKey: string;
  thumbnailType: string;
  thumbnailOptions: ThumbnailOptions;
  on2dAvatarSuccess: (payload: AvatarThumbnailSuccessCallbackPayload) => void;
  on3dAvatarSuccess: (payload: AvatarThumbnailSuccessCallbackPayload) => void;
  on2dAvatarFailure: (payload: AvatarThumbnailSuccessCallbackPayload) => void;
  on3dAvatarFailure: (payload: AvatarThumbnailSuccessCallbackPayload) => void;
}

export enum ThumbnailTypes {
  avatar = "Avatar",
  avatarHeadshot = "AvatarHeadshot",
  gameIcon = "GameIcon",
  gameThumbnail = "GameThumbnail",
  badgeIcon = "BadgeIcon",
  gamePassIcon = "GamePass",
  assetThumbnail = "Asset",
  bundleThumbnail = "BundleThumbnail",
  userOutfit = "Outfit",
  groupIcon = "GroupIcon",
  developerProductIcon = "DeveloperProduct",
  universeThumbnail = "UniverseThumbnail",
  universeThumbnails = "UniverseThumbnails",
  placeGameIcon = "PlaceGameIcon",
  lookThumbnail = "Look",
}

const useLoadAvatarPage = () => {
  const avatarTypeService: AvatarTypeService = useAvatarTypeService();

  const { initializeTabs } = useAvatarTabsContext();
  const [avatarSettings, setAvatarSettings] = useState<AvatarSettings>();
  const [avatarRules, setAvatarRules] = useState<PlayerAvatarConfig>();
  const [avatarDetails, setAvatarDetails] = useState<AvatarConfigV2>();
  const [catalogMetaData, setCatalogMetaData] = useState<CatalogSettings>();
  const [headShapes, setHeadShapes] = useState<HeadShape[]>([]);

  const [avatarType, setAvatarType] = useState<AvatarType>();

  const [scaleEnabled, setScaleEnabled] = useState(false);

  const systemFeedback = useSystemFeedback();

  useEffect(() => {
    setScaleEnabled(avatarType === "R15");
  }, [avatarType]);

  const [enableContinuousLoad, setEnableContinuousLoad] = useState<boolean>(false);

  const [pageLoaded, setPageLoaded] = useState<boolean>(false);

  const [categoryDict, setCategoryDict] = useState<Record<string, string>>();
  const [subcategoryDict, setSubcategoryDict] = useState<Record<string, string>>();

  const [shirtId, setShirtId] = useState<number>();
  const [tShirtId, setTShirtId] = useState<number>();
  const [pantsId, setPantsId] = useState<number>();

  const { setAssetTypeLookups } = avatarTypeService;

  const [avatarThumbnailDataModel, setAvatarThumbnailDataModel] =
    useState<AvatarThumbnailDataModel>();

  const getCategories = useCallback(() => {
    return AvatarAPIService.getCategories().then(result => {
      setCategoryDict(result as Record<string, string>);
    });
  }, []);

  const getSubcategories = useCallback(() => {
    return AvatarAPIService.getSubcategories().then(result => {
      setSubcategoryDict(result as Record<string, string>);
    });
  }, []);

  const getAvatarThumbnailSuccessCallback = useCallback((thumbailType: string) => {
    return ({ duration }: AvatarThumbnailSuccessCallbackPayload) => {
      getThumbnailMetrics()?.logFinalThumbnailTime(duration, thumbailType);
    };
  }, []);

  const getAvatarThumbnailFailureCallback = useCallback((thumbailType: string) => {
    return () => {
      getThumbnailMetrics()?.logThumbnailTimeout(thumbailType);
    };
  }, []);

  const getCreateUrlAssetTypeIds = useCallback(() => {
    const shirtAssetType = AvatarAccoutrementService.getAssetTypeByName("Shirt");
    setShirtId(shirtAssetType?.id);
    const tShirtAssetType = AvatarAccoutrementService.getAssetTypeByName("T-Shirt");
    setTShirtId(tShirtAssetType?.id);
    const pantsAssetType = AvatarAccoutrementService.getAssetTypeByName("Pants");
    setPantsId(pantsAssetType?.id);
  }, []);

  const loadRulesSuccessCallBack = useCallback(
    (avatarRulesResult: PlayerAvatarConfig) => {
      const rules = {
        ...avatarRulesResult,
      };
      const packageType: WearableAssetType = {
        id: 32,
        name: "Package",
        maxNumber: 0,
      };

      rules.wearableAssetTypes.push(packageType);

      setAvatarRules(rules);

      setAssetTypeLookups(rules.wearableAssetTypes);
    },
    [setAssetTypeLookups],
  );

  const { setCurrentlyWornAssets, setEquippedBackgroundId } =
    useCurrentlyWearingAssetsStoreContext();

  const loadAvatarDetailsSuccessCallBack = useCallback(
    (avatarDetailsResult: AvatarConfigV2) => {
      const details = {
        ...avatarDetailsResult,
      };
      setAvatarDetails(details);

      setCurrentlyWornAssets(avatarDetailsResult.assets);

      setEquippedBackgroundId(avatarDetailsResult.equippedBackgroundAssetId);

      setAvatarType(details.playerAvatarType as AvatarType);
    },
    [setCurrentlyWornAssets, setEquippedBackgroundId],
  );

  const getContinuousLoadPolicy = useCallback(() => {
    try {
      AvatarAPIService.getAppPolicyBehavior().then(
        result => {
          if (typeof result.EnableContinuousLoad === "boolean") {
            setEnableContinuousLoad(result.EnableContinuousLoad);
          } else {
            setEnableContinuousLoad(false);
          }
        },
        () => {
          setEnableContinuousLoad(false);
        },
      );
    } catch {
      setEnableContinuousLoad(false);
    }
  }, []);

  const loadHeadShapes = useCallback(() => {
    AvatarAPIService.getAvatarInventory(
      "recentAdded",
      [{ itemType: "headshape", itemSubType: 1 }],
      undefined,
    )
      .then(response => {
        const shapes = response.avatarInventoryItems
          .map((item: AvatarInventoryItem) => item.headShape)
          .filter((shape: HeadShape | undefined): shape is HeadShape => shape !== undefined);
        setHeadShapes(shapes);
      })
      .catch(() => {
        // Error loading head shapes - fail silently
      });
  }, []);

  const loadAvatarPageCallBackSuccess = useCallback(
    (result: [PlayerAvatarConfig, AvatarConfigV2, void, CatalogSettings]) => {
      const loadRulesResult = result[0];
      const getAvatarRequestResult = result[1];
      const getCatalogMetaDataRequestResult = result[3];

      setAvatarSettings(defaultSettings);
      loadRulesSuccessCallBack(loadRulesResult);

      getCreateUrlAssetTypeIds();
      initializeTabs(getCatalogMetaDataRequestResult);

      loadAvatarDetailsSuccessCallBack(getAvatarRequestResult);

      setCatalogMetaData(getCatalogMetaDataRequestResult);

      setPageLoaded(true);

      document.querySelector(".content")?.classList.add("seven-column");

      getContinuousLoadPolicy();
      loadHeadShapes();
    },
    [
      getContinuousLoadPolicy,
      getCreateUrlAssetTypeIds,
      initializeTabs,
      loadAvatarDetailsSuccessCallBack,
      loadRulesSuccessCallBack,
      loadHeadShapes,
    ],
  );

  const loadAvatarDetails = useCallback(() => {
    const getAvatarRequest = AvatarAPIService.getAvatarV2(false);
    getAvatarRequest
      .then(result => {
        loadAvatarDetailsSuccessCallBack(result);
      })
      .catch(() => {
        // Catch error here
      });
  }, [loadAvatarDetailsSuccessCallBack]);

  const initializeAvatarThumbnail = useCallback(() => {
    setAvatarThumbnailDataModel({
      thumbnailCacheKey: "",
      thumbnailType: ThumbnailTypes.avatar,
      thumbnailOptions: {
        size: ThumbnailAvatarsSize.size352,
      },
      on2dAvatarSuccess: getAvatarThumbnailSuccessCallback("2dThumbnailOnLoad"),
      on3dAvatarSuccess: getAvatarThumbnailSuccessCallback("3dThumbnail"),
      on2dAvatarFailure: getAvatarThumbnailFailureCallback("2dThumbnailOnLoad"),
      on3dAvatarFailure: getAvatarThumbnailFailureCallback("3dThumbnail"),
    });
  }, [getAvatarThumbnailFailureCallback, getAvatarThumbnailSuccessCallback]);

  useEffect(() => {
    const loadAvatarPage = async () => {
      try {
        // Configure the API service before any request so the very first avatar read
        // (below) honors the V4 read/write flags.
        AvatarAPIService.configure(defaultSettings);

        const getRulesRequest = AvatarAPIService.getAvatarRules();
        const getAvatarRequest = AvatarAPIService.getAvatarV2(false);
        const getCatalogMetaDataRequest = AvatarAPIService.getCatalogMetaData(false);

        setAvatarType(avatarConstants.avatarType.defaultOnPageLoad as AvatarType);

        getSubcategories().catch(() => {
          // Catch error here
        });
        getCategories().catch(() => {
          // Catch error here
        });

        const results = await Promise.all([
          getRulesRequest,
          getAvatarRequest,
          initializeAvatarThumbnail(),
          getCatalogMetaDataRequest,
        ]);

        loadAvatarPageCallBackSuccess(results);
      } catch (error) {
        reportAXError({
          itemName: "AvatarPageCallbackError",
          counterName: "AvatarEditorError",
          log: parseError(error),
        });

        systemFeedback.error(avatarConstants.page.errorLoadingPage);
      }
    };

    loadAvatarPage().catch(() => {
      // Error handling done within loadAvatarPage
    });
  }, [
    getCategories,
    getSubcategories,
    initializeAvatarThumbnail,
    loadAvatarPageCallBackSuccess,
    systemFeedback,
  ]);

  return {
    avatarType,
    setAvatarType,
    avatarSettings,
    categoryDict,
    subcategoryDict,
    avatarThumbnailDataModel,
    pageLoaded,
    enableContinuousLoad,
    shirtId,
    tShirtId,
    pantsId,
    loadAvatarDetails,
    avatarRules,
    avatarDetails,
    catalogMetaData,
    scaleEnabled,
    setScaleEnabled,
    avatarTypeService,
    headShapes,
  };
};

export default useLoadAvatarPage;
