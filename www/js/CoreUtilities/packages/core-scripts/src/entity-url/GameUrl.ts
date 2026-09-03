import EntityUrl from "./EntityUrl";

class GameUrl extends EntityUrl {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  getRelativePath(id: number): string {
    return `/games/${id}`;
  }
}

export default GameUrl;
