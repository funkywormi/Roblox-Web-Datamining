export const getDirectoryFromPath = (path: string): string => {
  return path.substring(0, path.lastIndexOf("/"));
};

export default getDirectoryFromPath;
