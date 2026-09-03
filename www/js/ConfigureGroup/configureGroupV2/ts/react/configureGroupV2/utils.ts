import { Endpoints } from 'Roblox';

const getProfileUrl = (userId: number): string => {
  return Endpoints
    ? Endpoints.getAbsoluteUrl(`/users/${userId}/profile`)
    : `/users/${userId}/profile`;
};

export default getProfileUrl;
