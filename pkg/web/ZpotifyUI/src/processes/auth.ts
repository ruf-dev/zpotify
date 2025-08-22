import {Observable} from "rxjs";

import {AuthRequest, AuthResponse, AuthAuthData, UserAPI} from "@zpotify/api";

import {apiPrefix} from "@/processes/api.ts";

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



