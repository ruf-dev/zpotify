export type UserInfo = {
    username: string
}

export type AuthData = {
    token: string
    refreshToken: string
    accessExpirationDate: Date
    refreshExpirationDate: Date
}
