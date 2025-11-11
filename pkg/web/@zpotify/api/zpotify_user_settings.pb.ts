/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

type Absent<T, K extends keyof T> = { [k in Exclude<keyof T, K>]?: undefined };

type OneOf<T> =
  | { [k in keyof T]?: undefined }
  | (keyof T extends infer K
      ? K extends string & keyof T
        ? { [k in K]: T[K] } & Absent<T, K>
        : never
      : never);

export type UserSettings = {
  homeSegments?: HomePageSegment[];
  ui?: UiSettings;
};

export type HomePageSegmentPlaylistSegment = {
  playlistId?: string;
};

export type HomePageSegmentManagement = Record<string, never>;

type BaseHomePageSegment = {
};

export type HomePageSegment = BaseHomePageSegment &
  OneOf<{
    playlistSegment: HomePageSegmentPlaylistSegment;
    managementSegment: HomePageSegmentManagement;
  }>;

export type UiSettings = {
  locale?: string;
};