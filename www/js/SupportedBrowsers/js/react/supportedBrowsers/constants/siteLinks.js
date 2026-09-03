import { Endpoints } from 'Roblox';

const { getAbsoluteUrl } = Endpoints;

const homePageLink = getAbsoluteUrl('/');
const gamesPageLink = getAbsoluteUrl('/discover');

export default {
  homePageLink,
  gamesPageLink
};
