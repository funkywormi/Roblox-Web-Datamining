export default {
  urls: {
    profilePageUrl(userId: number): string {
      return `/users/${userId}/profile`;
    }
  }
};
