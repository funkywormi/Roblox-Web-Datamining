// Since the notification stream is angularjs code, the notification-stream-base-view below is for
// notification stream code to engage with navigation component
import React from "react";
// @ts-expect-error TODO: remove this once react notification stream is out
import angular from "angular";

export default class NotificationStreamBase extends React.Component {
  container: HTMLDivElement | null = null;

  componentDidMount() {
    try {
      angular.module("notificationStream");
      angular.bootstrap(this.container, ["notificationStream"]);
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    return (
      <div
        ref={c => {
          this.container = c;
        }}
        className="notification-stream-base"
        // eslint-disable-next-line react/no-unknown-property
        notification-stream-base-view="true"
      />
    );
  }
}
