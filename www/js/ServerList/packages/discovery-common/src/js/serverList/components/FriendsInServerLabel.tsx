/* eslint-disable react/jsx-no-literals */
import React, { Fragment, useMemo } from "react";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { Link } from "@rbx/core-ui";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { renderToString } from "react-dom/server";
import serverListConstants from "../constants/serverListConstants";
import urlConstants from "../constants/urlConstants";

const { getUserProfileUrl } = urlConstants;
const { resources } = serverListConstants;

type TFriendInServer = {
  id: number | null;
  displayName?: string;
};

type TFriend = TFriendInServer & { id: number };

type TFriendsInServerLabelProps = {
  translate: TranslateFunction;
  players: TFriendInServer[];
};

function FriendsInServerLabel({ translate, players }: TFriendsInServerLabelProps) {
  const friends = useMemo(() => {
    // You may be your own friend but we aren't showing you in this list
    return players.filter(
      (player): player is TFriend => player.id !== null && player.id !== authenticatedUser.id,
    );
  }, [players]);

  const getLinkifiedFriendName = (friend: TFriend | undefined) => {
    if (friend === undefined) {
      return <Fragment />;
    }

    // Display names don't allow html characters, so we don't need to escape them.
    return (
      <Link href={getUserProfileUrl(friend.id)} className="text-name">
        {friend.displayName}
      </Link>
    );
  };

  const friendsText = useMemo(() => {
    if (friends.length === 0) {
      return "";
    }

    const firstFriendLinkHtmlString = renderToString(getLinkifiedFriendName(friends[0]));
    if (friends.length === 1) {
      const labelKey = resources.friendInServerLabel;
      return (
        translate(labelKey, {
          friend: firstFriendLinkHtmlString,
        }) || `Friend in this server: ${firstFriendLinkHtmlString}`
      );
    }

    const secondFriendLinkHtmlString = renderToString(getLinkifiedFriendName(friends[1]));
    if (friends.length === 2) {
      const labelKey = resources.twoFriendsInServerLabel;
      return (
        translate(labelKey, {
          firstFriend: firstFriendLinkHtmlString,
          secondFriend: secondFriendLinkHtmlString,
        }) ||
        `Friends in this server: ${firstFriendLinkHtmlString} and ${secondFriendLinkHtmlString}`
      );
    }

    const numOtherFriends = friends.length - 2;

    return translate(resources.manyFriendsInServerLabel, {
      firstFriend: firstFriendLinkHtmlString,
      secondFriend: secondFriendLinkHtmlString,
      numOtherFriends,
    });
  }, [friends, translate]);

  if (friends.length === 0) {
    return <Fragment />;
  }

  return (
    <div
      className="text friends-in-server-label"
      aria-label={friendsText.replace(/<[^>]*>/g, "")}
      dangerouslySetInnerHTML={{
        __html: friendsText,
      }}
    />
  );
}

export default FriendsInServerLabel;
