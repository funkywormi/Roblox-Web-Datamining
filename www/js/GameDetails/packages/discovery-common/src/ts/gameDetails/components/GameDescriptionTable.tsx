import React from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { truncNumber } from "@rbx/core-scripts/format/number";
import { getAbsoluteUrl } from "@rbx/core-scripts/util/url";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { TGetGameDetails, TGetUniverseVoiceStatus } from "../../common/types/bedev1Types";
import { getNumberFormat, dateTimeFormatter } from "../../common/utils/parsingUtils";
import { gameDetailsPage } from "../../common/constants/configConstants";
import { FeatureGameDetails } from "../../common/constants/translationConstants";
import useSortIdMapping from "../hooks/useSortIdMapping";
import { TSortIdMapping } from "../../common/types/bedev2Types";

type TDescriptionLabel = {
  label: string;
  value: React.ReactNode;
};

const GameDescriptionTableValueText = ({
  valueText,
  id,
  dataTestId,
}: {
  valueText: string | JSX.Element;
  id?: string;
  dataTestId?: string;
}): JSX.Element => {
  return (
    <p className="text-lead font-caption-body" id={id} data-testid={dataTestId}>
      {valueText}
    </p>
  );
};

GameDescriptionTableValueText.defaultProps = {
  id: undefined,
  dataTestId: undefined,
};

const GameDescriptionTableGenreElement = ({
  genreText,
  sortIdMapping,
  untranslatedGenreText,
}: {
  genreText: string;
  sortIdMapping?: TSortIdMapping;
  untranslatedGenreText?: string;
}): JSX.Element => {
  const sortId: string | undefined = untranslatedGenreText
    ? sortIdMapping?.genreToSortId[untranslatedGenreText]
    : undefined;
  const linkHref = sortId
    ? getAbsoluteUrl(`/charts/${sortId}`)
    : getAbsoluteUrl(`/discover/?Keyword=${encodeURIComponent(genreText)}`);
  return (
    <a className="text-lead text-link font-caption-body" href={linkHref}>
      {genreText}
    </a>
  );
};

export type TGameDescriptionTableProps = {
  gameDetails: TGetGameDetails;
  universeVoiceStatus: TGetUniverseVoiceStatus;
  shouldShowFavoritesCount: boolean | undefined;
  translate: TranslateFunction;
};

const GameDescriptionTable = ({
  gameDetails,
  universeVoiceStatus,
  shouldShowFavoritesCount,
  translate,
}: TGameDescriptionTableProps): JSX.Element => {
  const { sortIdMapping } = useSortIdMapping();
  const shouldRemoveCreatedDate = !authenticatedUser()?.isAuthenticated;

  const descriptionTable: TDescriptionLabel[] = [
    {
      label: translate(FeatureGameDetails.LabelPlaying),
      value: <GameDescriptionTableValueText valueText={getNumberFormat(gameDetails.playing)} />,
    },
    ...(shouldShowFavoritesCount
      ? [
          {
            label: translate(FeatureGameDetails.LabelFavorites),
            value: (
              <GameDescriptionTableValueText
                dataTestId="game-favorites-count"
                valueText={getNumberFormat(gameDetails.favoritedCount)}
              />
            ),
          },
        ]
      : []),
    {
      label: translate(FeatureGameDetails.LabelVisits),
      value: (
        <GameDescriptionTableValueText
          valueText={truncNumber(
            gameDetails.visits,
            undefined,
            undefined,
            gameDetailsPage.visitsTruncationDigitsAfterDecimalPoint,
          )}
          id="game-visits-count"
        />
      ),
    },
    {
      label: translate(FeatureGameDetails.LabelVoiceChat),
      value: (
        <GameDescriptionTableValueText
          valueText={
            universeVoiceStatus.isUniverseEnabledForVoice
              ? translate(FeatureGameDetails.LabelSupported)
              : translate(FeatureGameDetails.LabelNotSupported)
          }
          dataTestId="voice-value"
        />
      ),
    },
    {
      label: translate(FeatureGameDetails.LabelCamera),
      value: (
        <GameDescriptionTableValueText
          valueText={
            universeVoiceStatus.isUniverseEnabledForAvatarVideo
              ? translate(FeatureGameDetails.LabelSupported)
              : translate(FeatureGameDetails.LabelNotSupported)
          }
          dataTestId="camera-value"
        />
      ),
    },
    ...(!shouldRemoveCreatedDate
      ? [
          {
            label: translate(FeatureGameDetails.LabelCreated),
            value: (
              <GameDescriptionTableValueText
                valueText={dateTimeFormatter.getShortDate(gameDetails.created)}
              />
            ),
          },
        ]
      : []),
    {
      label: translate(FeatureGameDetails.LabelUpdated),
      value: (
        <GameDescriptionTableValueText
          valueText={dateTimeFormatter.getShortDate(gameDetails.updated)}
        />
      ),
    },
    {
      label: translate(FeatureGameDetails.LabelMaxPlayers),
      value: <GameDescriptionTableValueText valueText={getNumberFormat(gameDetails.maxPlayers)} />,
    },
    {
      label: translate(FeatureGameDetails.LabelGenre),
      value: gameDetails.genre_l1 ? (
        <GameDescriptionTableGenreElement
          genreText={gameDetails.genre_l1}
          sortIdMapping={sortIdMapping}
          untranslatedGenreText={gameDetails.untranslated_genre_l1}
        />
      ) : (
        <GameDescriptionTableValueText valueText={translate(FeatureGameDetails.LabelUnavailable)} />
      ),
    },
    ...(gameDetails.genre_l2
      ? [
          {
            label: translate(FeatureGameDetails.LabelSubgenre),
            value: (
              <GameDescriptionTableGenreElement
                genreText={gameDetails.genre_l2}
                sortIdMapping={sortIdMapping}
              />
            ),
          },
        ]
      : []),
  ];
  return (
    <ul className="border-top border-bottom game-stat-container">
      {descriptionTable.map(stat => (
        <li key={stat.label} className="game-stat">
          <p className="text-label text-overflow font-caption-header">{stat.label}</p>
          {stat.value}
        </li>
      ))}
    </ul>
  );
};

export default GameDescriptionTable;
