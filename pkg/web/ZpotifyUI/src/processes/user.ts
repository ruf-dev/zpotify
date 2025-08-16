import {AuthData, UserInfo} from "@/model/user.ts";
import {UserAPI} from "@zpotify/api";

import {apiPrefix} from "@/processes/api/api.ts";

export async function GetMe(auth: AuthData): Promise<UserInfo> {
    const req = {}

    return UserAPI.Me(req,
        apiPrefix({
                accessToken: auth.token
            }
        ))
        .then((r) => {
            return {
                username: r.userData?.username
            } as UserInfo
        })
}
