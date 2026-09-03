import React, { useEffect, useMemo } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { FeatureGameDetails } from "../../common/constants/translationConstants";
import GameDescriptionText from "./GameDescriptionText";
import { common } from "../../common/constants/configConstants";
import bedev1Services from "../../common/services/bedev1Services";
import { TDiscoverySessionInfo } from "../../common/constants/eventStreamConstants";

type TGameDescriptionProps = {
  name: string | undefined;
  sourceName: string | undefined;
  description: string | undefined;
  sourceDescription: string | undefined;
  universeId: string;
  referralSessionInfo: TDiscoverySessionInfo;
  translate: TranslateFunction;
};

const GameDescription = ({
  name,
  sourceName,
  description,
  sourceDescription,
  universeId,
  referralSessionInfo,
  translate,
}: TGameDescriptionProps): JSX.Element => {
  const [isSwappedToSource, setIsSwappedToSource] = React.useState(false);

  const [userLanguageName, setUserLanguageName] = React.useState<string | undefined>(undefined);

  useEffect(() => {
    bedev1Services
      .getUserLocale()
      .then(locale => {
        if (locale?.nativeName) {
          setUserLanguageName(locale.nativeName);
        }
      })
      .catch(() => {
        // Non-blocking, fallback to Action.Translate text
      });
  }, []);

  const isEligibleForSwap = React.useMemo(() => {
    return (
      (name && sourceName && name !== sourceName) ||
      (description && sourceDescription && description !== sourceDescription)
    );
  }, [name, sourceName, description, sourceDescription]);

  useEffect(() => {
    // This is a temporary work-around to swap the game title before it is migrated to web-frontend
    // Epic for the Game Details Header migration: https://roblox.atlassian.net/browse/CLIGROW-1048
    if (name && sourceName && name !== sourceName) {
      try {
        const gameTitleContainer = document.querySelector(".game-title-container");
        if (gameTitleContainer) {
          const gameTitleElement = gameTitleContainer.querySelector("h1");
          if (gameTitleElement) {
            gameTitleElement.textContent = isSwappedToSource ? sourceName : name;
          }
        }
      } catch {
        // Non-blocking, the description will still swap
      }
    }
  }, [isSwappedToSource, name, sourceName]);

  const swapButtonText = useMemo(() => {
    if (isSwappedToSource) {
      if (userLanguageName) {
        return translate(FeatureGameDetails.ActionSwapToTranslation, {
          userLanguage: userLanguageName,
        });
      }
      return translate(FeatureGameDetails.ActionTranslate) || "Translate";
    }

    return translate(FeatureGameDetails.ActionSwapToSource);
  }, [isSwappedToSource, userLanguageName, translate]);

  return (
    <React.Fragment>
      <GameDescriptionText
        descriptionText={isSwappedToSource ? sourceDescription : description}
        universeId={universeId}
        referralSessionInfo={referralSessionInfo}
      />
      {isEligibleForSwap && (
        <div
          role="button"
          tabIndex={0}
          className="toggle-translation-button"
          data-testid="swap-to-source-button"
          onClick={() => setIsSwappedToSource(!isSwappedToSource)}
          onKeyDown={e => {
            if (e.key === common.keyBoardEventCode.enter) {
              e.stopPropagation();
              e.preventDefault();
              setIsSwappedToSource(!isSwappedToSource);
            }
          }}
        >
          <span className="swap-translated-content font-bold">{swapButtonText}</span>
          <span className="icon-common-refresh" />
        </div>
      )}
    </React.Fragment>
  );
};

export default GameDescription;
