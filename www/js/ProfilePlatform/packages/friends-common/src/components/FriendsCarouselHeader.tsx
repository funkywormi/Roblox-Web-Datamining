import { JSX } from "react";
import environmentUrls from "@rbx/environment-urls";

const FriendsCarouselHeader = ({
  friendsCount,
  profileUserId,
  isOwnUser,
  translate,
}: {
  friendsCount: number | null;
  profileUserId: number;
  isOwnUser: boolean;
  translate: (key: string) => string;
}): JSX.Element => {
  const friendsCountString = `(${friendsCount ?? 0})`;
  const friendsUrl = isOwnUser
    ? `${environmentUrls.websiteUrl}/users/friends#!/friends`
    : `${environmentUrls.websiteUrl}/users/${profileUserId}/friends#!/friends`;

  const carouselHeaderText = "Label.Friends";

  return (
    <div className="container-header people-list-header">
      {friendsCount == null ? (
        <h2>{translate(carouselHeaderText)}</h2>
      ) : (
        <h2>
          {translate(carouselHeaderText)}
          <span className="friends-count">{friendsCountString}</span>
        </h2>
      )}
      <a href={friendsUrl} className="btn-secondary-xs btn-more see-all-link-icon">
        {translate("Heading.SeeAll")}
      </a>
    </div>
  );
};

export default FriendsCarouselHeader;
