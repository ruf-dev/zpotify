import {RefObject} from "react";

import {
    MeRequest, MeResponse,
    UserAPI,
} from "@zpotify/api";

import {UserInfo} from "@/model/User.ts";

import {AuthMiddleware} from "@/processes/Auth.ts";
import {BaseService} from "@/processes/BaseService.ts";
import {InitReq} from "@/processes/Api.ts";

export default class UserService extends BaseService {

    constructor(auth: RefObject<AuthMiddleware>) {
        super(auth)
    }

    public async GetMe(): Promise<UserInfo> {
        const req: MeRequest = {};

        return this.executeAuthApiCall(
            (initReq: InitReq) => {
                return UserAPI.Me(req, initReq)
            })
            .then((r: MeResponse) => {
                if (!r.userData) {
                    throw new Error("empty user data in GetMe response")
                }

                return {
                    username: r.userData.username,
                    permissions: {
                        canDelete: r.permissions?.canDelete || false
                    },
                } as UserInfo
            })
    }
}

