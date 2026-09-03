import React from "react";
import classNames from "classnames";
import { TranslateFunction } from "@rbx/core-scripts/react";
import gameGuidelinesConstants from "../constants/gameGuidelinesConstants";
import getIgrsImage from "../utils/getIgrsImage";
import urlConstants from "../constants/urlConstants";
import { IgrsRating } from "../types";

export type IgrsRatingLabelProps = {
  igrsRating: IgrsRating;
  igrsRatingDisplayMessage?: string;
  translate: TranslateFunction;
};

/**
 * Renders an age rating label with an IGRS rating image and display message to Indonesian accounts.
 */
export const IgrsRatingLabel = ({
  igrsRating,
  igrsRatingDisplayMessage,
  translate,
}: IgrsRatingLabelProps): JSX.Element => {
  const igrsImage = getIgrsImage(igrsRating);

  return (
    <div className="igrs-rating-container col-xs-12 section-content">
      <a
        className="igrs-rating-content text-link"
        href={urlConstants.indonesianContentMaturityUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {igrsImage && (
          <img
            src={igrsImage}
            alt={translate(gameGuidelinesConstants.IgrsImageAltTextKey)}
            className="igrs-rating-image"
          />
        )}
        <span
          className={classNames("igrs-rating-text", {
            "text-label-medium igrs-rating-text-unrated": igrsRating === IgrsRating.Unrated,
          })}
        >
          {igrsRatingDisplayMessage}
        </span>
      </a>
    </div>
  );
};

export default IgrsRatingLabel;
