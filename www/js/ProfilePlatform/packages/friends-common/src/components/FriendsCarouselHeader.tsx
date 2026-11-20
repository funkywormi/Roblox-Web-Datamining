import { JSX } from "react";
import environmentUrls from "@rbx/environment-urls";
import FriendCarouselNames from "../constants/friendCarouselNames";

const FriendsCarouselHeader = ({
  friendsCount,
  profileUserId,
  isOwnUser,
  carouselName,
  translate,
}: {
  friendsCount: number | null;
  profileUserId: number;
  isOwnUser: boolean;
  carouselName: FriendCarouselNames;
  translate: (key: string) => string;
}): JSX.Element => {
  const friendsCountString = `(${friendsCount ?? 0})`;
  const friendsUrl = isOwnUser
    ? `${environmentUrls.websiteUrl}/users/friends#!/friends`
    : `${environmentUrls.websiteUrl}/users/${profileUserId}/friends#!/friends`;

  const carouselHeaderText = "Label.Friends";

  //Only need to update to chevron icon in the profiles page for now rather than affecting other pages such as homepage
  if (carouselName === FriendCarouselNames.WebProfileFriendsCarousel) {
    return (
      <div className="container-header people-list-header">
        <a href={friendsUrl} className="items-center inline-flex">
          <h2 className="content-emphasis text-heading-small padding-none inline-block">
            {translate(carouselHeaderText)}
            {friendsCount != null && <span className="friends-count">{friendsCountString}</span>}
          </h2>
          <span className="icon-chevron-heavy-right" />
        </a>
      </div>
    );
  }

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
