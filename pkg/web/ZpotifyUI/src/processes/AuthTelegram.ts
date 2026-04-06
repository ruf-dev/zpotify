import {Observable} from "rxjs";

import {
    AuthAPI,
    AuthData,
    AuthViaAsyncRequest, AuthViaAsyncResponse,
} from "@/app/api/zpotify";

import {apiPrefix} from "@/processes/Api.ts";

export interface AuthResults {
    AuthUUID?: string
    AuthData?: AuthData
}

export function AuthenticateViaTelegram(): Observable<AuthResults> {
    return new Observable<AuthResults>((subscriber) => {
        const req = {} as AuthViaAsyncRequest;

        AuthAPI.AuthAsync(req,
            (status: AuthViaAsyncResponse) => subscriber.next({
                AuthUUID: status.authUuid,
                AuthData: status.authData,
            }),
            apiPrefix())
    })
}





