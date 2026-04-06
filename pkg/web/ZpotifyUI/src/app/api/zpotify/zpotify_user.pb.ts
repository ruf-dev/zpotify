/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */


export enum AuthMethods {
  AuthMethod_NotSpecified = "AuthMethod_NotSpecified",
  AuthMethod_Offline = "AuthMethod_Offline",
  AuthMethod_Telegram = "AuthMethod_Telegram",
}

export type Permissions = {
  canUpload?: boolean;
  earlyAccess?: boolean;
  canCreatePlaylist?: boolean;
};