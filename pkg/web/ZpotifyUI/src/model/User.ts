export type UserInfo = {
    username: string
    permissions: SongListPermissions
}

export type Session = {
    token: string
    refreshToken: string
    accessExpirationDate: Date
    refreshExpirationDate: Date
}


export type SongListPermissions = {
    canDelete: boolean
}
