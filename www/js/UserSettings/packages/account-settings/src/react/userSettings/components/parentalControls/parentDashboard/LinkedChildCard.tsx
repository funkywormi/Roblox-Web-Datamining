import React from "react";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
} from "roblox-thumbnails";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-utilities";
import classNames from "classnames";
import useGetAllPendingParentalConsents from "../../../hooks/useGetAllPendingParentalConsents";
import { selectChildPagesForChildUserId } from "../../../../apis/slices/childPagesSlice";
import { useAppSelector } from "../../../../redux/hooks";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import SettingListItem from "../../../../common/components/routing/SettingListItem";
import birthdayUtils from "../../../utils/birthdayUtils";
import { getConsentDetailsPageUrl, getProfileUrl } from "../../../constants/urlConstants";
import { getLinkedChildDetailsPath } from "../../../constants/parentalControls/parentalControlsConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

export const LinkedChildCard = ({
  childInfo,
  isMultiChildView,
}: {
  childInfo: TChildInfo;
  isMultiChildView?: boolean;
}): JSX.Element => {
  const { translate } = useTranslation();

  const childPages = useAppSelector(selectChildPagesForChildUserId(childInfo.userId));
  const { allConsents, hasMore } = useGetAllPendingParentalConsents(childInfo?.userId);

  const getChildThumbnail = (): JSX.Element => {
    const thumbnail = (
      <Thumbnail2d
        containerClass="linked-profile-thumbnail"
        type={ThumbnailTypes.avatarHeadshot}
        size={ThumbnailAvatarHeadshotSize.size150}
        targetId={childInfo?.userId}
        format={ThumbnailFormat.webp}
        imgClassName="linked-profile-image"
      />
    );

    return thumbnail;
  };

  const childAge = birthdayUtils.calculateAgeFromISO(childInfo.birthDate);

  const numPendingConsents = allConsents?.length || 0;
  const pendingConsentsDisplay = hasMore ? `${numPendingConsents}+` : numPendingConsents;

  const openRequestDetailsPage = () => {
    // If there is only 1 request, go directly to that consent's detail page instead of the consent center
    if (allConsents.length === 1) {
      const consentDetailsUrl = getConsentDetailsPageUrl(allConsents[0]?.id ?? "");
      window.location.href = consentDetailsUrl;
    }
  };

  const pendingRequestsIcon = (
    <div className="pending-requests-counter small">{pendingConsentsDisplay}</div>
  );

  const childUsername = `@${childInfo?.userName}`;

  const childCard = (
    <React.Fragment>
      {/* Only show edit profile button on the child detailed view */}
      {!isMultiChildView && childPages && (
        <span className="edit-child-profile-btn">
          <Link to={childPages.editProfilePage.path}>
            <span className="icon-edit" />
          </Link>
        </span>
      )}
      <a href={getProfileUrl(childInfo?.userId)}>
        <div className="linked-profile-card-thumbnails-container">{getChildThumbnail()}</div>
      </a>
      <span className="card-display-name font-header-1">{childInfo?.displayName}</span>
      <span className="small text">{childUsername}</span>
      <span className="small text child-description">
        {translate(parentalControlsTranslationConstants.ageLabel, { ageInYears: childAge })}
      </span>
    </React.Fragment>
  );

  const pendingRequestsButton = (
    <div className="child-card-action-button">
      <SettingListItem
        title={translate(parentalControlsTranslationConstants.parentalConsents.pendingRequests)}
        metadata={pendingRequestsIcon}
        showArrow
      />
    </div>
  );

  const cardClassNames = classNames("linked-profile-card", {
    "section-content": isMultiChildView,
  });
  return (
    <div className={cardClassNames}>
      {isMultiChildView ? (
        <NavLink
          className="linked-profile-card-link"
          to={getLinkedChildDetailsPath(childInfo.userId)}
        >
          {childCard}
        </NavLink>
      ) : (
        childCard
      )}

      {isMultiChildView && numPendingConsents > 0 && childPages && (
        <React.Fragment>
          <div className="rbx-divider" />
          {/* If there is only 1 request, go directly to that consent's detail page instead of the consent center */}
          {allConsents.length === 1 ? (
            <span
              onClick={openRequestDetailsPage}
              role="button"
              aria-label={translate(
                parentalControlsTranslationConstants.parentalConsents.pendingRequests,
              )}
              tabIndex={0}
              onKeyPress={openRequestDetailsPage}
            >
              {pendingRequestsButton}
            </span>
          ) : (
            <NavLink to={childPages.consentCenterPage.path}>{pendingRequestsButton}</NavLink>
          )}
        </React.Fragment>
      )}
    </div>
  );
};

LinkedChildCard.defaultProps = {
  isMultiChildView: false,
};

export default LinkedChildCard;
