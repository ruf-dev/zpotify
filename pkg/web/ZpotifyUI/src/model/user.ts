export type UserInfo = {
    username: string
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
