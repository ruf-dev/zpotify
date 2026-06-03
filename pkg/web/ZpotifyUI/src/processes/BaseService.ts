import {AuthMiddleware} from "@/processes/Auth.ts";

import {
    ErrorReason,
    Errors,
    GrpcError,
    isReason,
    ServiceError,
    WithCode,
    WithIsNonRetryable,
    WithTitle
} from "@/processes/Errors.ts";

import {InitReq} from "@/app/api/zpotify";

export class BaseService {
    private auth: AuthMiddleware

    constructor(auth: AuthMiddleware) {
        this.auth = auth
    }

    protected async executeAuthApiCall<T>(
        callback: (initReq: InitReq) => Promise<T>,
    ): Promise<T> {
        return withRetries<T>(
            async (): Promise<T> =>
                callback(await this.auth.GetMetadata())
                    .catch(async (err: GrpcError | ServiceError) => {
                        if (err instanceof ServiceError) {
                            throw err
                        }

                        if (err.message === "Failed to fetch") {
                            throw new ServiceError(WithTitle("Server is not available. Try again later"));
                        }

                        if (err.code == Errors.UNAUTHENTICATED) {
                            console.log(err)

                            if (isReason(err.details, ErrorReason.ACCESS_TOKEN_NOT_FOUND)) {
                                throw new ServiceError(
                                    WithTitle('Session expired. Login again'),
                                    WithIsNonRetryable(true));
                            }
                            if (err.message == 'token expired') {
                                await this.auth.RefreshToken()

                                throw new ServiceError(
                                    WithTitle('Session expired. Refreshing'),
                                    WithIsNonRetryable(false),
                                );
                            }
                        }
                        if (err.code === Errors.UNAVAILABLE) {
                            throw new ServiceError(
                                WithTitle(err.message),
                                WithCode(Errors.UNAVAILABLE),
                                WithIsNonRetryable(true),
                            );
                        }

                        throw new ServiceError(WithTitle(err.message));
                    })
                    .then()
            , 3)
    }
}


function withRetries<T>(callback: () => Promise<T>, retries: number): Promise<T> {

    return callback()
        .catch((err) => {
            if (err.isNonRetryable) {
                throw err
            }

            if (retries > 0) {
                return withRetries(callback, retries - 1);
            }

            throw err;
        });
}


export interface WebApiParams {
    targetUrl: string
    authHeaderValue: string
}
