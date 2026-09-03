// Since the notification stream is angularjs code, the notification-stream-indicator below is for
// notification stream code to engage with navigation component
import React from "react";
// @ts-expect-error TODO: remove this once react notification stream is out
import angular from "angular";

export default class NotificationStreamIcon extends React.Component {
  container: HTMLSpanElement | null = null;

  componentDidMount() {
    try {
      angular.module("notificationStreamIcon");
      angular.bootstrap(this.container, ["notificationStreamIcon"]);
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    return (
      <span
        ref={c => {
          this.container = c;
        }}
        className="nav-robux-icon rbx-menu-item"
      >
        {/* eslint-disable-next-line react/no-unknown-property */}
        <span id="notification-stream-icon-container" notification-stream-indicator="true" />
      </span>
    );
  }
}
