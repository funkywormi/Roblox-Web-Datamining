import { useQuery } from "@tanstack/react-query";
import { getContentRatingLogoPolicy } from "./fetch";

export default function useContentRatingLogos(): {
  shouldDisplayBrazilRatingLogo: boolean;
  shouldDisplayItalyRatingLogo: boolean;
} {
  const { data } = useQuery({
    queryKey: ["contentRatingLogoPolicy"],
    queryFn: getContentRatingLogoPolicy,
  });

  return {
    shouldDisplayBrazilRatingLogo: data?.displayBrazilRatingLogo ?? false,
    shouldDisplayItalyRatingLogo: data?.displayItalyRatingLogo ?? false,
  };
}
