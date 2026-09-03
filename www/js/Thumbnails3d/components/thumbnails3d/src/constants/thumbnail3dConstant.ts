import { WebGLRenderer } from "three";
import { WebGLJson } from "../types";

export const MaxRenderDistanceDefault = 1000;
export const MinRenderDistanceDefault = 0.1;
export const DefaultMaxRetry = 10;
export const DefaultMaxRetryInterval = 1500;

export enum ThumbnailTypes {
  Avatar = "Avatar",
  Animation = "Animation",
  Asset = "Asset",
  UserOutfit = "UserOutfit",
}

export interface ThumbnailRenderer {
  container: HTMLElement;
  renderer: WebGLRenderer;
}

export type ThumbnailRenderers = Record<string, ThumbnailRenderer>;

export type ThumbnailCanvasSuccess = (canvas: HTMLCanvasElement) => void;

export type ThumbnailCanvasFail = () => void;

// TODO: old, migrated code
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Thumbnail3DJsonFail = (error: string) => any;

export interface Thumbnail3DJsonStats {
  realRegeneration: boolean;
  startTime: Date;
  retriesDone: number;
  version: string;
}
export enum ThumbnailStates {
  error = "Error",
  complete = "Completed",
  inReview = "InReview",
  pending = "Pending",
  blocked = "Blocked",
}

export interface Thumbnail3DJsonData {
  imageUrl: string;
  state: ThumbnailStates;
  version: string;
}

// TODO: old, migrated code
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Thumbnail3DJsonSuccess = (json: WebGLJson, stats: Thumbnail3DJsonStats) => any;

export const FeatureName = "Thumbnail3DWeb";
export const LoadSuccessName = "LoadSuccess";
export const LoadSuccessMetricsType = "Sequence";
export const LoadFailureName = "LoadFailure";
export const LoadFailureMetricsType = "Counter";
