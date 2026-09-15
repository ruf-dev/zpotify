import { AuthMiddleware } from '@/shared/api/Auth.ts';
import {
    ErrorReason,
    Errors,
    GrpcError,
    isReason,
    ServiceError,
    WithCode,
    WithIsNonRetryable,
    WithReason,
    WithTitle,
} from '@/shared/api/Errors.ts';
import { InitReq } from '@/app/api/zpotify';

let _auth: AuthMiddleware | null = null;

export function setAuthMiddleware(auth: AuthMiddleware) {
    _auth = auth;
}

function getAuth(): AuthMiddleware {
    if (!_auth) throw new Error('AuthMiddleware not initialized');
    return _auth;
}

export class BaseService {
    protected async executeAuthApiCall<T>(callback: (initReq: InitReq) => Promise<T>): Promise<T> {
        return withRetries<T>(
            async (): Promise<T> =>
                callback(await getAuth().GetMetadata())
                    .catch(async (err: GrpcError | ServiceError) => {
                        if (err instanceof ServiceError) {
                            throw err;
                        }

                        if (err.message === 'Failed to fetch') {
                            throw new ServiceError(
                                WithTitle('Server is not available. Try again later'),
                                WithIsNonRetryable(true),
                            );
                        }

                        if (err.code == Errors.UNAUTHENTICATED) {
                            if (isReason(err.details, ErrorReason.ACCESS_TOKEN_NOT_FOUND)) {
                                getAuth().invalidateSession();

                                throw new ServiceError(
                                    WithTitle('Session expired. Login again'),
                                    WithIsNonRetryable(true),
                                    WithReason(ErrorReason.ACCESS_TOKEN_NOT_FOUND),
                                );
                            }

                            if (err.message == 'token expired') {
                                await getAuth().RefreshToken();

                                throw new ServiceError(
                                    WithTitle('Session expired. Refreshing'),
                                    WithIsNonRetryable(false),
                                    WithReason(ErrorReason.ACCESS_TOKEN_EXPIRED),
                                );
                            }
                        }

                        if (err.code === Errors.UNAVAILABLE) {
                            throw new ServiceError(
                                WithTitle(err.message),
                                WithCode(Errors.UNAVAILABLE),
                                WithIsNonRetryable(false),
                            );
                        }

                        if (err.code == Errors.INVALID_ARGUMENT) {
                            throw new ServiceError(
                                WithTitle(err.message),
                                WithCode(Errors.INVALID_ARGUMENT),
                                WithIsNonRetryable(true),
                            );
                        }

                        if (err.code == Errors.ALREADY_EXISTS) {
                            throw new ServiceError(
                                WithTitle(err.message),
                                WithCode(Errors.ALREADY_EXISTS),
                                WithIsNonRetryable(true),
                            );
                        }

                        if (err.code == Errors.NOT_FOUND) {
                            throw new ServiceError(
                                WithTitle(err.message),
                                WithCode(Errors.NOT_FOUND),
                                WithIsNonRetryable(true),
                            );
                        }

                        if (err.code == Errors.PERMISSION_DENIED) {
                            throw new ServiceError(
                                WithTitle(err.message),
                                WithCode(Errors.PERMISSION_DENIED),
                                WithIsNonRetryable(true),
                            );
                        }

                        throw new ServiceError(WithTitle(err.message));
                    })
                    .then(),
            RETRYABLE_ERROR_MAX_RETRIES,
        );
    }
}

const RETRYABLE_ERROR_MAX_RETRIES = 3;
const RETRYABLE_ERROR_DELAY_MS = 5000;

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function withRetries<T>(callback: () => Promise<T>, retries: number): Promise<T> {
    return callback().catch((err) => {
        if (err.isNonRetryable) {
            throw err;
        }

        if (retries > 0) {
            return delay(RETRYABLE_ERROR_DELAY_MS).then(() => withRetries(callback, retries - 1));
        }

        throw err;
    });
}

export interface WebApiParams {
    targetUrl: string;
    authHeaderValue: string;
}
