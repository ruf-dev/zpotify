import {RefObject} from "react";

import {AuthMiddleware} from "@/processes/Auth.ts";
import {BaseService} from "@/processes/BaseService.ts";
import {
    ServiceError, WithDescription,
    WithHttpStatus,
    WithTitle
} from "@/processes/Errors.ts";

export interface WebApi {
    UploadFile(file: File): Promise<string>
}

enum WebApiUriPath {
    Upload = '/wapi/files/upload'
}

export class WebApiImpl extends BaseService implements WebApi {
    constructor(auth: RefObject<AuthMiddleware>) {
        super(auth)
    }

    UploadFile(file: File): Promise<string> {
        return this.executeAuthApiCall(async (initReq) => {
                const formData = new FormData()
                formData.append('file', file, file.name)

                const headers = new Headers(initReq.headers as HeadersInit)
                headers.delete('Content-Type')

                const url = `${initReq.pathPrefix ?? ''}${WebApiUriPath.Upload}`


                const response = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: formData,
                })

                if (response.ok) {
                    const body = await response.json() as { id: number }
                    return String(body.id)
                }

                throw await ServiceErrorFromHttp(response)
            }
        )
    }
}


async function ServiceErrorFromHttp(r: Response): Promise<ServiceError> {
    return new ServiceError(
        WithHttpStatus(r.status),
        WithTitle("Error calling WebApi"),
        WithDescription(await r.text())
    )
}
