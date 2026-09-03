export const isBuildExperience = (creationSource?: string): boolean =>
  creationSource?.toLowerCase() === "build";

export default isBuildExperience;
