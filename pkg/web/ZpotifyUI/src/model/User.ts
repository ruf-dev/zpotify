export type UserInfo = {
    username: string
    permissions: Permissions
}

export type AuthData = {
    session: Session
}

export type Session = {
    token: string
    refreshToken: string
    accessExpirationDate: Date
    refreshExpirationDate: Date
}


export type Permissions = {
    canDelete: boolean
}
