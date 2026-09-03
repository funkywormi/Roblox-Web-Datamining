import { useState, useEffect } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import {
  getTradeStatusCount,
  getFriendsRequestCount,
  getUnreadPrivateMessagesCount,
} from "../../services/navigationService";
import ScrollList from "./ScrollList";
import {
  subscribeToFriendsNotifications,
  subscribeToMessagesNotifications,
} from "../../util/navigationUtil";

export default function ScrollListContainer() {
  const user = authenticatedUser();
  const [friendsData, setFriendsData] = useState({ count: 0 });
  const [messagesData, setMessagesData] = useState({ count: 0 });
  const [tradeData, setTradeData] = useState({ count: 0 });

  useEffect(() => {
    const handleFriendsEvent = () => {
      getFriendsRequestCount().then(
        ({ data: friendsRequestCountData }) => {
          setFriendsData(friendsRequestCountData);
        },
        error => {
          console.error(error);
        },
      );
    };
    const handleMessagesEvent = () => {
      getUnreadPrivateMessagesCount().then(({ data: unreadPrivateMessageData }) => {
        setMessagesData(unreadPrivateMessageData);
      });
    };
    let unsubscribeToFriendsNotifications = () => {
      // do nothing
    };
    let unsubscribeToMessagessNotifications = () => {
      // do nothing
    };
    if (user != null) {
      unsubscribeToFriendsNotifications = subscribeToFriendsNotifications(handleFriendsEvent);
      unsubscribeToMessagessNotifications = subscribeToMessagesNotifications(handleMessagesEvent);
      getFriendsRequestCount().then(
        ({ data: friendsRequestCountData }) => {
          setFriendsData(friendsRequestCountData);
        },
        error => {
          console.error(error);
        },
      );
      getUnreadPrivateMessagesCount().then(
        ({ data: unreadPrivateMessageData }) => {
          setMessagesData(unreadPrivateMessageData);
        },
        error => {
          console.error(error);
        },
      );
      getTradeStatusCount().then(
        ({ data: tradeCountData }) => {
          setTradeData(tradeCountData);
        },
        error => {
          console.error(error);
        },
      );
    }
    return () => {
      unsubscribeToFriendsNotifications();
      unsubscribeToMessagessNotifications();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ScrollList {...{ friendsData, messagesData, tradeData }} />;
}
