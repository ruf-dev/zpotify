import {Observable} from "rxjs";

import {AuthAuthData, AuthRequest, AuthResponse, RefreshRequest, RefreshResponse, UserAPI} from "@zpotify/api";

import {apiPrefix, InitReq} from "@/processes/Api.ts";
import {Session} from "@/model/User.ts";
import {ErrorReason, GrpcError, ServiceError, WithIsNonRetryable, WithReason, WithTitle} from "@/processes/Errors.ts";

export interface AuthResults {
    AuthUUID?: string
    AuthData?: AuthAuthData
}

export function AuthenticateViaTelegram(): Observable<AuthResults> {
    return new Observable<AuthResults>((subscriber) => {
        const req = {} as AuthRequest;

        UserAPI.Auth(req,
            (status: AuthResponse) => subscriber.next({
                AuthUUID: status.authUuid,
                AuthData: status.authData,
            }),
            apiPrefix())
    })
}


export class AuthMiddleware {
    session?: Session;

    constructor(session?: Session) {
        if (!session) {
            session = fromLocalStorage()
        }

        this.session = session;
    }

    RefreshToken() {
        return this.refreshToken()
    }

    async GetMetadata(): Promise<InitReq> {
        return apiPrefix(
            {
                accessToken: await this.getAccessToken()
            }
        )
    }

    private async getAccessToken(): Promise<string> {
        if (!this.session) {
            throw new Error("User is not authenticated")
        }

        if (this.session.accessExpirationDate < new Date()) {
            await this.refreshToken()
        }

        return this.session.token
    }

    private async refreshToken() {
        if (!this.session) {
            throw new ServiceError(
                WithTitle("User is not authenticated"),
                WithIsNonRetryable(true)
            )
        }

        if (this.session.refreshExpirationDate < new Date()) {
            throw new ServiceError(
                WithTitle("Refresh token expired"),
                WithIsNonRetryable(true)
            )
        }

        const req: RefreshRequest = {
            refreshToken: this.session.refreshToken
        }

        const newSession = await UserAPI.RefreshToken(req, apiPrefix())
            .then(fromAuthData)
            .catch((e: GrpcError) => {

                if (e.details.find(d => d.reason == ErrorReason.REFRESH_TOKEN_NOT_FOUND)) {
                    // TODO
                    // this.logout()
                }

                throw new ServiceError(
                    WithTitle(e.message),
                    WithIsNonRetryable(true),
                    WithReason(e.details.find((d => d.reason != undefined))?.reason)
                )
            })

        this.login(newSession)

        return this.session
    }

    login(s: Session) {
        this.session = s;
        saveToLocalStorage(s)
    }

    logout() {
        clearLocalStorage()
    }
}


function fromAuthData(r: RefreshResponse): Session {
    return {
        token: r.authData?.accessToken,
        refreshToken: r.authData?.refreshToken,
        accessExpirationDate: r.authData?.accessExpiresAt,
        refreshExpirationDate: r.authData?.refreshExpiresAt,
    } as Session
}


function saveToLocalStorage(session: Session) {
    localStorage.setItem(getLocalStorageAuthInfoKey(), JSON.stringify(session))
}

function fromLocalStorage(): Session | undefined {
    const authInfoFromLocalStorage = localStorage.getItem(getLocalStorageAuthInfoKey())
    if (!authInfoFromLocalStorage) {
        return
    }

    return JSON.parse(authInfoFromLocalStorage)
}

function clearLocalStorage() {
    localStorage.removeItem(getLocalStorageAuthInfoKey())
}

function getLocalStorageAuthInfoKey(): string {
    return "user_session"
}
