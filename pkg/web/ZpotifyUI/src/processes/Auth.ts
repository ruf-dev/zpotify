import {Observable} from "rxjs";

import {AuthRequest, AuthResponse, AuthAuthData, UserAPI, RefreshRequest, RefreshResponse} from "@zpotify/api";

import {apiPrefix, InitReq} from "@/processes/Api.ts";
import {Session} from "@/model/User.ts";

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
            throw new Error("User is not authenticated")
        }

        if (this.session.refreshExpirationDate < new Date()) {
            throw new Error("Refresh token expired")
        }

        const req: RefreshRequest = {
            refreshToken: this.session.refreshToken
        }

        this.session = await UserAPI.RefreshToken(req, apiPrefix())
            .then(fromAuthData)

        return this.session
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
