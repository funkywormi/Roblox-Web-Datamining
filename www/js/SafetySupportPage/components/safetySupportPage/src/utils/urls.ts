import { Endpoints } from '@rbx/core-scripts/legacy/Roblox';

const { getAbsoluteUrl } = Endpoints;

export const accountStatusUrl = getAbsoluteUrl('/safety-dashboard?t_source=help-safety');
export const reportInboxUrl = getAbsoluteUrl(
  '/safety-dashboard?t_source=help-safety#/report-inbox'
);
export const helpUrl = getAbsoluteUrl('/info/help?locale=');
export const supportUrl = getAbsoluteUrl('/support');
export const supportCenterUrl = getAbsoluteUrl('/support-center');
