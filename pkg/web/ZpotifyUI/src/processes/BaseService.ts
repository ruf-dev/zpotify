import {AuthMiddleware} from "@/processes/Auth.ts";
import {ErrorCodes} from "@/processes/ErrorCodes.ts";
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

        return withRetries<T>(async (): Promise<T> => {
            try {
                return await callback(await this.auth.current.GetMetadata());
            } catch (err: any) {
                if (err instanceof TypeError && err.message === "Failed to fetch") {
                    throw err;
                }

                if (err.code === ErrorCodes.UNAUTHENTICATED) {
                    await this.auth.current.RefreshToken();
                }

                throw err;
            }
        }, 3)
    }
}


function withRetries<T>(callback: () => Promise<T>, retries: number): Promise<T> {
    return callback().catch(err => {
        if (retries > 0) {
            return withRetries(callback, retries - 1);
        }
        throw err;
    });
}

