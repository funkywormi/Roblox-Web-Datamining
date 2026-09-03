import { gameGuidelines } from "../../common/constants/configConstants";
import { IgrsRating } from "../types";

import igrsUnratedImage from "../images/igrs-pending.png";
import igrs13PlusImage from "../images/igrs-13.png";
import igrs15PlusImage from "../images/igrs-15.png";
import igrs18PlusImage from "../images/igrs-18.png";

const getIgrsImage = (igrsRating: IgrsRating): string | null => {
  switch (igrsRating) {
    case IgrsRating.Unrated:
      return igrsUnratedImage;

    case IgrsRating.ThirteenPlus:
      return igrs13PlusImage;

    case IgrsRating.FifteenPlus:
      return igrs15PlusImage;

    case IgrsRating.EighteenPlus:
      return igrs18PlusImage;

    default:
      window.EventTracker?.fireEvent(gameGuidelines.UnexpectedIgrsRatingCounterEvent);
      return null;
  }
};

export default getIgrsImage;
