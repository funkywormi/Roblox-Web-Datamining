import React, { useEffect, useState, useCallback } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import ExperimentationService from "@rbx/experimentation";
import communityLinksService from "../services/communityLinksService";
import metadataConstants from "../../gameDetails/constants/metadataConstants";
import { CommunityInfo } from "../types";
import { getCommunityExternalLinkUrl } from "../utils/urlHelper";
import { FeatureCommunityLinks } from "../../common/constants/translationConstants";
import { experimentLayer } from "../constants/experimentConstants";

type CommunityLinkDisplayConfig = {
  inTreatment: boolean;
  linkVariant?: string;
};

type ExperimentLayerValues = {
  communityLinkDisplayConfig?: CommunityLinkDisplayConfig;
};

export type TCommunityLinkDisplayProps = {
  translate: WithTranslationsProps["translate"];
};

const sendClickEvent = (entityId: string, guildedServerId: string): void => {
  const context = "communityLinkDisplay";
  const eventName = "clickCommunityLink";
  sendEventWithTarget(eventName, context, {
    guildedServerId,
    entityType: "universe",
    entityId,
  });
};

export const CommunityLinkDisplay = ({
  translate,
}: TCommunityLinkDisplayProps): JSX.Element | null => {
  const [communityInfo, setCommunityInfo] = useState<CommunityInfo | null>(null);

  const { universeId = "", placeName = "" } = metadataConstants.metadataData() || {};

  const [linkDisplayConfig, setLinkDisplayConfig] = useState<
    CommunityLinkDisplayConfig | undefined
  >(undefined);

  const [experimentExposureLogged, setExperimentExposureLogged] = useState(false);

  const fetchExperimentConfig = useCallback(async () => {
    const experimentConfig: ExperimentLayerValues =
      await ExperimentationService.getAllValuesForLayer(experimentLayer);
    setLinkDisplayConfig(experimentConfig?.communityLinkDisplayConfig);
  }, []);

  const fetchCommunityInfo = useCallback(async () => {
    try {
      const communityInfoResponse: CommunityInfo =
        await communityLinksService.getLinkedCommunity(universeId);
      setCommunityInfo(communityInfoResponse);
    } catch {
      setCommunityInfo(null);
    }
  }, [universeId]);

  const handleClick = useCallback(() => {
    if (communityInfo?.communityId) {
      sendClickEvent(universeId, communityInfo.communityId);
    }
  }, [universeId, communityInfo]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchCommunityInfo(), fetchExperimentConfig()]);
    };
    const user = authenticatedUser();
    if (!user?.isUnder13 && user?.isAuthenticated) {
      // eslint-disable-next-line no-void
      void fetchData();
    }
  }, [fetchCommunityInfo, fetchExperimentConfig]);

  /* if the request errors, if there is no linked community, if we failed to fetch the experiment, or the user
     has edit permissions for the experience but has set its visibility to private, display nothing */
  if (!communityInfo?.communityId || communityInfo.visibility === "private" || !linkDisplayConfig) {
    return null;
  }

  if (!experimentExposureLogged) {
    // only log experiment exposure once, and only if a community exists and experiment fetch succeeded
    setExperimentExposureLogged(true);
    ExperimentationService.logLayerExposure(experimentLayer);
  }

  if (!linkDisplayConfig.inTreatment) {
    return null;
  }

  return (
    <div className="game-community-section">
      <h2 className="game-community-title">
        {translate(FeatureCommunityLinks.HeadingCommunityTitle)}
      </h2>
      <a
        className="game-community-link"
        data-testid="game-community-link"
        href={getCommunityExternalLinkUrl(communityInfo.communityId)}
        onClick={handleClick}
        target="_blank"
        rel="noreferrer"
      >
        <div className="game-community-icon-container">
          <div className="game-community-icon" />
        </div>
        <div className="game-community-info-container">
          <div>
            <h5 className="game-community-name">{communityInfo.name}</h5>
          </div>
          <div>
            <span className="game-community-description text-default">
              {communityInfo.description ||
                translate(FeatureCommunityLinks.DescriptionCommunityDefault, {
                  experienceName: placeName,
                })}
            </span>
          </div>
        </div>
        <div className="game-community-visit-container">
          <button className="btn btn-cta-md btn-min-width" type="button">
            {translate(FeatureCommunityLinks.LabelViewButton)}
          </button>
        </div>
      </a>
    </div>
  );
};

export default withTranslations<{}>(CommunityLinkDisplay, ["Feature.CommunityLinks"]);
