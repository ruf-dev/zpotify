import {AuthMiddleware} from "@/processes/Auth.ts";
import {
    ErrorReason,
    Errors,
    GrpcError,
    isReason,
    ServiceError,
    WithIsNonRetryable,
    WithTitle
} from "@/processes/Errors.ts";
import {InitReq} from "@/processes/Api.ts";
import {RefObject} from "react";

export class BaseService {
    private auth: RefObject<AuthMiddleware>

    constructor(auth: RefObject<AuthMiddleware>) {
        this.auth = auth
    }

    protected async executeAuthApiCall<T>(
        callback: (initReq: InitReq) => Promise<T>,
    ): Promise<T> {

        return withRetries<T>(
            async (): Promise<T> =>
                callback(await this.auth.current.GetMetadata())
                    .catch(async (err: GrpcError) => {
                        if (err.message === "Failed to fetch") {
                            throw new ServiceError(WithTitle("Server is not available. Try again later"));
                        }

                        if (err.code == Errors.UNAUTHENTICATED) {
                            if (isReason(err.details, ErrorReason.ACCESS_TOKEN_NOT_FOUND)) {
                                throw new ServiceError(
                                    WithTitle('Session expired. Login again'),
                                    WithIsNonRetryable(true));
                            }

                            if (isReason(err.details, ErrorReason.ACCESS_TOKEN_EXPIRED)) {
                                await this.auth.current.RefreshToken()
                                console.debug('token refreshed')
                                throw new ServiceError(
                                    WithTitle('Session expired. Refreshing'),
                                    WithIsNonRetryable(false),
                                );
                            }
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

