import $ from "jquery";
import { DeviceMeta } from "@rbx/core-scripts/legacy/Roblox";
import { linkifyHtml } from "./segments";

function isMobile() {
  if (typeof DeviceMeta === "undefined") {
    return false;
  }
  return DeviceMeta().isPhone;
}

function alreadyLinkified(str) {
  return $(`<div>${str}</div>`).find("a[href]").length > 0;
  // toggleDesc adds in <a onClick> elements which can make this return true incorrectly.
}

function linkifyString(str) {
  if (alreadyLinkified(str)) {
    return str;
  }
  return linkifyHtml(str, isMobile());
}

export default {
  String: linkifyString,
};
