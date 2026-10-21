import type { EntityData } from "../../../types";
import { EntityStore } from "../EntityStore";

export const SONG_CONTENT_TYPE = "song";

export const SONG_DEFAULT_PATHS: readonly string[] = ["song_id", "songId"];

export interface SongData extends EntityData {
  id?: string;
  mediaAssetId?: string;
  title?: string;
  artist?: string;
}

export class SongStore extends EntityStore<SongData> {}
