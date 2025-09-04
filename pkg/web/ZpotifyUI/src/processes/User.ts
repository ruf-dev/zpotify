import {
    MeRequest, MeResponse,
    AuthRequest, AuthResponse,
    UserAPI,
    RefreshRequest,
    RefreshResponse,
} from "@zpotify/api";

import {apiPrefix} from "@/processes/Api.ts";
import {AuthData, UserInfo} from "@/model/User.ts";

export default class UserService {
    authData: AuthData;

    constructor(authData: AuthData) {
        this.authData = authData;
    }

    public async Auth(req: AuthRequest, entityNotifier?: (resp: AuthResponse) => void): Promise<void> {
        return UserAPI.Auth(req, entityNotifier, apiPrefix())
    }

    public async GetMe(): Promise<UserInfo> {
        const req: MeRequest = {};

        return UserAPI
            .Me(req, await this.getMetadata())
            .then((r: MeResponse) => {
                if (!r.userData) {
                    throw new Error("empty user data in GetMe response")
                }

                return {
                    username: r.userData.username
                } as UserInfo
            })
    }

    private async getMetadata() {
        return apiPrefix(
            {
                accessToken: await this.getAccessToken()
            }
        )
    }

    private async getAccessToken(): Promise<string> {
        if (!this.authData) {
            throw new Error("User is not authenticated")
        }

        if (this.authData.session.accessExpirationDate < new Date()) {
            await this.refreshToken()
        }


        return this.authData.session.token
    }

    RefreshToken() {
        return this.refreshToken()
    }

    private async refreshToken() {
        if (!this.authData) {
            throw new Error("User is not authenticated")
        }

        if (this.authData.session.refreshExpirationDate < new Date()) {
            throw new Error("Refresh token expired")
        }

        const req: RefreshRequest = {
            refreshToken: this.authData.session.refreshToken
        }

        return UserAPI.RefreshToken(req, apiPrefix())
            .then((r: RefreshResponse) => {
                return {
                    session: {
                        token: r.authData?.accessToken,
                        refreshToken: r.authData?.refreshToken,
                        accessExpirationDate: r.authData?.accessExpiresAt,
                        refreshExpirationDate: r.authData?.refreshExpiresAt,
                    }
                } as AuthData
            })
    }
}

