import {BaseService} from "@/processes/BaseService.ts";

import {
    AuthAPI,
    AuthRequest,
    AuthData,
    RefreshRequest, InitReq
} from "@/app/api/zpotify";

import {ErrorReason, GrpcError, ServiceError, WithIsNonRetryable, WithReason, WithTitle} from "@/processes/Errors.ts";
import {apiPrefix} from "@/processes/Api.ts";

export interface IAuthService {
    AuthViaPass: (login: string, password: string) => Promise<AuthData>
}

export class AuthService extends BaseService implements IAuthService {
    async AuthViaPass(login: string, password: string): Promise<AuthData> {
        const req = {
            logPass: {
                login: login,
                password: password,
            }
        } as AuthRequest

        return this.executeAuthApiCall(
            async (initReq) => {
                return AuthAPI
                    .Auth(req, initReq)
                    .then(r => {
                        if (!r.authData) {
                            throw new Error("authData is empty")
                        }

                        console.debug(r.authData)
                        return r.authData
                    })
            })
    };
}

export class AuthMiddleware {
    session?: AuthData;

    constructor(session?: AuthData) {
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

        if (this.session.accessExpiresAt < new Date()) {
            await this.refreshToken()
        }

        return this.session.accessToken || ""
    }

    private async refreshToken() {
        if (!this.session) {
            throw new ServiceError(
                WithTitle("User is not authenticated"),
                WithIsNonRetryable(true)
            )
        }

        if (this.session.refreshExpiresAt < new Date()) {
            throw new ServiceError(
                WithTitle("Refresh token expired"),
                WithIsNonRetryable(true)
            )
        }

        const req: RefreshRequest = {
            refreshToken: this.session.refreshToken
        }

        const newSession = await AuthAPI.RefreshToken(req, apiPrefix())
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

        newSession.authData && this.login(newSession.authData)

        return this.session
    }

    login(s: AuthData) {
        this.session = s;
        saveToLocalStorage(s)
    }

    logout() {
        clearLocalStorage()
    }
}

function saveToLocalStorage(session: AuthData) {
    localStorage.setItem(getLocalStorageAuthInfoKey(), JSON.stringify(session))
}

function fromLocalStorage(): AuthData | undefined {
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
