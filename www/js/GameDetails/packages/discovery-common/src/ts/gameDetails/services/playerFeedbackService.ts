import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";

const { apiGatewayUrl } = environmentUrls;

export enum ReviewCategoryType {
  Undefined = 0,
  Upvote = 1,
  Downvote = 2,
}

export type TReviewErrorResponse = {
  data: {
    code: string;
    detail: string;
    message: string;
  };
};

export type TChannelInformation = {
  data: {
    capabilities: {
      can_submit_category_options: boolean;
      can_submit_comment: boolean;
      can_submit_review: boolean;
    };
    categories: [
      {
        type: string;
        label: string;
      },
    ];
    comment: {
      label: string;
      placeholder_text: string;
      minimum_length: number;
      maximum_length: number;
    };
    metadata: {
      form_title_label: string;
      disclaimer_label: string;
      submit_button_label: string;
    };
  };
};

const playerFeedbackApiUrl = `${apiGatewayUrl}/player-generated-reviews-service/v1/channels/experience-discovery-page/assets`;

export const submitReview = async (
  rootPlaceId: string | number,
  reviewCategory: ReviewCategoryType,
  reviewText: string,
): Promise<void> => {
  const url = `${playerFeedbackApiUrl}/${rootPlaceId}/reviews`;

  const urlConfig = {
    withCredentials: true,
    url,
  };

  const params = {
    comment: reviewText,
    category_type: reviewCategory,
    category_option_ids: [],
  };

  await http.post(urlConfig, params);
};

export const getChannelInformation = (
  rootPlaceId: string | number,
): Promise<TChannelInformation> => {
  const url = `${playerFeedbackApiUrl}/${rootPlaceId}`;

  const urlConfig = {
    withCredentials: true,
    url,
  };

  return http.get(urlConfig);
};
