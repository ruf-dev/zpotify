import {Permissions} from "@zpotify/api";

export type UserInfo = {
    username: string
    permissions: UserPermissions
}

export type Session = {
    token: string
    refreshToken: string
    accessExpirationDate: Date
    refreshExpirationDate: Date
}

export type UserPermissions = Permissions


export type SongListPermissions = {
    canDelete: boolean
}
